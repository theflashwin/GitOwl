from pymongo import MongoClient

MONGO_URI = "mongodb+srv://ashwin:ashwin@cluster0.fmupqcr.mongodb.net/raffy"
client = MongoClient(MONGO_URI)

db = client["greptile-takehome"]
commits = db["summaries"]

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

def save_new_changes(url: str, summaries: list, title: str, description: str):
    """
    Saves new commit summaries for a repository that does not exist in MongoDB.
    """
    if not summaries:
        return

    latest_commit = summaries[-1]["commit_hash"]

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
