from pymongo import MongoClient
import datetime
from datetime import datetime, timezone

from middlewares.schemas import User, RepoStates, UserStates

MONGO_URI = "mongodb+srv://ashwin:ashwin@cluster0.fmupqcr.mongodb.net/raffy"
client = MongoClient(MONGO_URI)

db = client["greptile-takehome"]
commits = db["summaries"]
users = db["users"]

def check_if_repo_exists(url: str) -> bool:
    
    result = commits.find_one({"repo_url": url})
    return result is not None

def save_existing_changes(url: str, new_summaries):
    """
    Updates an existing repository in MongoDB by appending new commit summaries.
    """

    if len(new_summaries) < 1:
        return

    latest_commit = new_summaries[-1]["commit_hash"]

    commits.update_one(
        {"repo_url": url},
        {
            "$set": {"latest_commit_stored": latest_commit},
            "$push": {"changes": {"$each": new_summaries}}
        }
    )

def check_if_repo_updating(repo_url: str):

    repo = get_existing_repo(url=repo_url)
    return repo["state"] == RepoStates.PROCESSING.value

def set_state(repo_url: str, state: RepoStates):
    
    commits.update_one(
        {"repo_url": repo_url},
        {"$set": {"state": state.value}}
    )

def save_new_changes(url: str, summaries: list, title: str, description: str, user_id: str):
    """
    Saves new commit summaries for a repository that does not exist in MongoDB.
    """

    latest_commit = summaries[-1]["commit_hash"] if summaries else "none"

    commit_history = {
        "title": title,
        "description": description,
        "repo_url": url,
        "latest_commit_stored": latest_commit,
        "passcode": "some_unique_key",  # You can modify this for authentication
        "context": "Initial commit history",
        "changes": summaries,
        "date_created": datetime.now(timezone.utc).isoformat(),
        "state": RepoStates.READY.value,
        "users": {user_id: UserStates.OWNER.value}
    }

    commits.insert_one(commit_history)

def get_existing_repo(url: str):

    return commits.find_one({"repo_url": url})

def init_user(user_id: str) -> User:
    
    new_user = {
        "user_id": user_id,
        "repos": []
    }

    users.insert_one(new_user)
    return new_user

def fetch_user(user_id: str) -> User:
    
    # first check if user exists
    user = users.find_one({"user_id": user_id})

    if user is None:
        user = init_user(user_id)

    return user

def set_repo_owner(repo_url: str, user_id: str):
    
    if users.find_one({"user_id": user_id}) is None:
        init_user(user_id)

    users.update_one(
        {"user_id": user_id},
        {"$push": {"repos": repo_url}}
    )

def get_repo_info(repo_url: str):

    repo = commits.find_one({"repo_url": repo_url})

    return {
        "name": repo["title"],
        "description": repo["description"],
        "date": repo["date_created"],
        "repo_url": repo["repo_url"]
    }

def check_user_free_tier(user_id: str):

    user = fetch_user(user_id=user_id)
    return len(user["repos"]) < 5

def edit_commit_title(repo_url: str, commit_hash: str, new_title: str):

    print(commit_hash)
    result = commits.update_one(
        {
            "repo_url": repo_url,
            "changes.commit_hash": commit_hash
        },
        {
            "$set": {
                "changes.$.title": new_title
            }
        }
    )
    print(result)


def edit_commit_description(repo_url: str, commit_hash: str, new_description: str):

    commits.update_one(
        {
            "repo_url": repo_url,
            "changes.commit_hash": commit_hash
        },
        {
            "$set": {
                "changes.$.description": new_description
            }
        }
    )

def edit_commit_bullet(repo_url: str, commit_hash: str, index: int, new_bullet: str):
    repo = commits.find_one({"repo_url": repo_url})

    if not repo:
        return False

    for commit in repo["changes"]:
        if commit["commit_hash"] == commit_hash:
            if 0 <= index < len(commit["changes"]):
                commit["changes"][index] = new_bullet
                break
            else:
                return False  # index out of bounds

    result = commits.update_one(
        {"repo_url": repo_url},
        {"$set": {"changes": repo["changes"]}}
    )

    return result.modified_count > 0

def edit_repo_title(repo_url: str, new_title: str):
    
    commits.update_one(
        {"repo_url": repo_url},
        {"$set": {"title": new_title}}
    )

def edit_repo_description(repo_url: str, new_description: str):
    
    commits.update_one(
        {"repo_url": repo_url},
        {"$set": {"description": new_description}}
    )

def delete_commit(repo_url: str, commit_hash: str):
    
    repo = commits.find_one({"repo_url": repo_url})

    # Filter out the commit to delete
    updated_changes = [commit for commit in repo["changes"] if commit["commit_hash"] != commit_hash]

    # Determine the new latest commit if needed
    latest_commit = repo["latest_commit_stored"]
    if latest_commit == commit_hash:
        latest_commit = updated_changes[-1]["commit_hash"] if updated_changes else None

    update_payload = {
        "changes": updated_changes,
        "latest_commit_stored": latest_commit
    }

    commits.update_one(
        {"repo_url": repo_url},
        {"$set": update_payload}
    )
