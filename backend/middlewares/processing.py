from openai import OpenAI
import git
import re

from middlewares.connection import get_diff
from middlewares import db

client = OpenAI()

# OpenAI.api_key = "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"

def parse_summary(response_text):
    """
    Extracts title, description, and bullet points from OpenAI response.
    Expects the format:
    Title: Some title
    Description: Some description
    - Change 1
    - Change 2
    """
    title_match = re.search(r"Title:\s*(.*)", response_text)
    description_match = re.search(r"Description:\s*(.*)", response_text)
    bullet_points = re.findall(r"-\s*(.*)", response_text)

    return {
        "title": title_match.group(1) if title_match else "Untitled",
        "description": description_match.group(1) if description_match else "No description available.",
        "changes": bullet_points if bullet_points else ["No detailed changes."]
    }

def summarize_git_repo(repo_path: str):
    """Summarizes commits iteratively in a structured format."""
    repo = git.Repo(repo_path)
    commits = list(repo.iter_commits())

    summaries = []

    for commit in reversed(commits):  # Start from the first commit
        diff = get_diff(repo_path, commit.hexsha)

        prompt = f"""
        Here are the changes introduced in the commit:
        {diff}

        Summarize this commit with:
        - Title: (Short, clear summary)
        - Description: (One or two sentences explaining the commit)
        - A bulleted list of major changes

        Make sure the bullets are formatted with "-"

        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are an AI that summarizes Git commits in a structured changelog format."},
                      {"role": "user", "content": prompt}]
        )

        parsed_summary = parse_summary(response.choices[0].message.content)
        parsed_summary["date"] = commit.authored_datetime.strftime("%Y-%m-%d %H:%M:%S")
        parsed_summary["commit_hash"] = commit.hexsha

        summaries.append(parsed_summary)

    return summaries

def summarize_existing_git_repo(repo_path: str, repo_url: str):
    """Summarizes only new commits since the last stored commit."""
    repo = git.Repo(repo_path)
    commits_list = list(repo.iter_commits())  # Get all commits
    repo_url = repo.remotes.origin.url  # Get the GitHub URL of the repo

    # Fetch the last stored commit from MongoDB
    existing_repo = db.get_existing_repo(url=repo_url)
    last_stored_commit = existing_repo["latest_commit_stored"] if existing_repo else None

    new_summaries = []

    for commit in reversed(commits_list):  # Start from the earliest commit
        if commit.hexsha == last_stored_commit:
            break  # Stop once we reach the last stored commit

        diff = get_diff(repo_path, commit.hexsha)

        prompt = f"""
        Here are the changes introduced in the commit:
        {diff}

        Summarize this commit with:
        - Title: (Short, clear summary)
        - Description: (One or two sentences explaining the commit)
        - A bulleted list of major changes

        Make sure the bullets are formatted with "-"
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are an AI that summarizes Git commits in a structured changelog format."},
                      {"role": "user", "content": prompt}]
        )

        summary = parse_summary(response.choices[0].message.content)
        summary["date"] = commit.authored_datetime.strftime("%Y-%m-%d %H:%M:%S")
        summary["commit_hash"] = commit.hexsha

        new_summaries.append(summary)

    # Save new commits only if there are any
    # if new_summaries:
    #     db.save_existing_changes(repo_url, new_summaries)

    return {"new_summaries": new_summaries}

