import git
from fastapi import HTTPException
import os
import tempfile
import shutil
from urllib.parse import urlparse
from github import Github
from github.GithubException import GithubException

def get_commits(repo_path: str, branch: str = "main"):
    repo = git.Repo(repo_path)
    commits = list(repo.iter_commits(branch))
    return commits

def get_initial_codebase(repo_path: str):
    """Extracts the full codebase at the first commit."""
    repo = git.Repo(repo_path)
    initial_commit = list(repo.iter_commits())[-1]  # The first commit ever

    # Checkout the commit in a temp directory
    temp_dir = tempfile.mkdtemp()
    repo.git.worktree("add", temp_dir, initial_commit.hexsha)

    # Read all files
    codebase = ""
    for root, _, files in os.walk(temp_dir):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    codebase += f"\n\n### File: " + file_path.replace(temp_dir, "") + "\n" + f.read()
            except Exception:
                continue

    # Cleanup
    repo.git.worktree("remove", temp_dir, force=True)
    shutil.rmtree(temp_dir, ignore_errors=True)

    return codebase

def get_diff(repo_path: str, commit_hash: str):

    repo = git.Repo(repo_path)
    commit = repo.commit(commit_hash)

    if len(commit.parents) == 0:
        return "Initial Commit"
    
    parent_commit = commit.parents[0]
    diff = repo.git.diff(parent_commit.hexsha, commit.hexsha, unified=3)

    return diff
    
def get_title(url: str):
    
    parsed_url = urlparse(url)
    path = parsed_url.path.strip('/').split('/')

    if len(path) >= 2:
        return path[1]
    else:
        return "Unknown Title"
    
def get_description(repo_url: str, github_token: str = None):
    """
    Retrieve the description of a GitHub repository.

    Parameters:
        repo_url (str): URL of the GitHub repository.
        github_token (str, optional): GitHub personal access token for authenticated requests.

    Returns:
        str: The repository description.
    """
    repo_path = "/".join(repo_url.rstrip("/").split("/")[-2:])
    
    if github_token:
        g = Github(github_token)
    else:
        g = Github()

    repo = g.get_repo(repo_path)
    return repo.description or "No description available."

def verify_access(repo_url: str) -> dict:

    repo_path = "/".join(repo_url.rstrip("/").split("/")[-2:])
    g = Github()  # Unauthenticated access attempt

    try:
        repo = g.get_repo(repo_path)
        # Attempting basic access to repository data (description)
        description = repo.description
        return {
            "status": "success",
            "message": "Can successfully access the repo!",
        }

    except GithubException as e:

        print(e)

        if e.status == 404:
            return {
            "status": "failure",
            "message": "Need api key",
            }
        else:
            return {
            "status": "error",
            "message": "Some network error occurred",
            }
        
def verify_github_token(repo_url: str, token: str) -> bool:

    repo_path = "/".join(repo_url.rstrip("/").split("/")[-2:])

    try:
        g = Github(token)
        g.get_repo(repo_path)
        return True
    except Exception as e:
        print(e)
        return False
