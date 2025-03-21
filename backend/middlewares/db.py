from pymongo import MongoClient

MONGO_URI = "mongodb+srv://ashwin:ashwin@cluster0.fmupqcr.mongodb.net/raffy"
client = MongoClient(MONGO_URI)

db = client["greptile-takehome"]
commits = db["summaries"]

def check_if_repo_exists(url: str) -> bool:
    
    result = commits.find_one({"repo_url": url})
    return result is not None

def save_existing_changes(url: str, summaries):
    """
    Updates an existing repository in MongoDB by appending new commit summaries.
    """
    if not summaries:
        return

    existing_repo = commits.find_one({"repo_url": url})

    # if not existing_repo:
    #     return save_new_changes(url, summaries)

    # Get the last stored commit
    last_stored_commit = existing_repo.get("latest_commit_stored", "")

    # Filter out commits that are already stored
    new_commits = []
    for summary in summaries:
        if summary.get("commit_hash") == last_stored_commit:
            break  # Stop when we reach the last stored commit
        new_commits.append(summary)

    if not new_commits:
        return  # No new commits to store

    latest_commit = new_commits[-1]["commit_hash"] if "commit_hash" in new_commits[-1] else last_stored_commit

    # Update MongoDB record
    commits.update_one(
        {"repo_url": url},
        {
            "$set": {"latest_commit_stored": latest_commit},
            "$push": {"changes": {"$each": new_commits}}
        }
    )

def save_new_changes(url: str, summaries: list, title: str, description: str):
    """
    Saves new commit summaries for a repository that does not exist in MongoDB.
    """
    if not summaries:
        return

    latest_commit = summaries[-1]["commit_hash"] if "commit_hash" in summaries[-1] else "unknown"

    commit_history = {
        "title": title,
        "description": description,
        "repo_url": url,
        "latest_commit_stored": latest_commit,
        "passcode": "some_unique_key",  # You can modify this for authentication
        "context": "Initial commit history",
        "changes": summaries,
    }

    commits.insert_one(commit_history)

def get_existing_repo(url: str):

    return commits.find_one({"repo_url": url})
