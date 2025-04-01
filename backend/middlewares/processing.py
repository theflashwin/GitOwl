from openai import OpenAI
import git
import re
from github import Github, GithubException

from typing import Optional

from middlewares.connection import get_diff
from middlewares import db
import os
from dotenv import load_dotenv

from middlewares.schemas import CommitSummaryResponse

client = OpenAI()
load_dotenv()

MAX_DIFF_LENGTH = 6000
MAX_COMMITS = 60
MAX_FILES = 150

def truncate_diff(diff: str, max_length: int = MAX_DIFF_LENGTH):
    if len(diff) > max_length:
        return diff[:max_length] + "\n\n[Truncated due to length]"
    return diff

def summarize_file_diff(file_diff: str):
    prompt = f"""
    Summarize the changes in this file in 2-3 clear, concise bullet points:

    {file_diff}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Summarize file diffs clearly and briefly."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

def summarize_commit(commit):
    file_summaries = []
    for file in commit.files[0:MAX_FILES]:
        if file.patch:
            truncated_patch = truncate_diff(file.patch)
            file_summary = summarize_file_diff(truncated_patch)
            file_summaries.append(f"- {file.filename}:\n{file_summary}")

    full_file_summary = "\n".join(file_summaries)

    commit_prompt = f"""
    Here are summaries of changes for each file:
    {full_file_summary}

    Now summarize the overall commit clearly with a title, description, and some of the most important changes.
    """

    response = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You summarize commits in a structured, changelog-friendly format."},
            {"role": "user", "content": commit_prompt}
        ],
        response_format=CommitSummaryResponse
    )
    result = response.choices[0].message.parsed

    return {
        "title": result.title,
        "description": result.description,
        "changes": result.important_changes,
        "date": commit.commit.author.date.strftime("%Y-%m-%d %H:%M:%S"),
        "commit_hash": commit.sha
    }

# DEPRACTED
def parse_summary(response_text):
    """
    Extract title, description, and bullets from AI response.
    Expected format:
    Title: some title
    Description: some description
    - bullet 1
    - bullet 2
    """
    title_match = re.search(r"Title:\s*(.*)", response_text)
    description_match = re.search(r"Description:\s*(.*)", response_text)
    bullet_points = re.findall(r"-\s*(.*)", response_text)

    headers_to_remove = ["Changes:", "Change:", "Summary:", "Bullets:"]

    bullet_points = [
        point.replace("*", "").strip()
        for point in bullet_points
        if point.strip() not in headers_to_remove
    ]

    title = title_match.group(1).replace("*", "").strip() if title_match else "Untitled"
    description = description_match.group(1).replace("*", "").strip() if description_match else "No description available."

    return {
        "title": title,
        "description": description,
        "changes": bullet_points[2:] if bullet_points else ["No detailed changes."]
    }

def summarize_github_repo(repo_url: str, api_key: Optional[str] = None, branch: str = "main"):
    repo_path = "/".join(repo_url.rstrip("/").split("/")[-2:])
    g = Github(api_key) if api_key else Github()

    repo = g.get_repo(repo_path)
    default_branch = repo.default_branch
    commits = repo.get_commits(os.getenv("GITHUB_API_URL"), sha=default_branch)

    commit_list = list(commits)[:MAX_COMMITS]  # safely slice the most recent commits
    commit_list.reverse()  # now oldest -> newest

    summaries = []

    for commit in commit_list:
        summary = summarize_commit(commit)
        summaries.append(summary)

    return summaries

def update_existing_repo(repo_url: str, api_key: Optional[str] = None):

    repo_path = "/".join(repo_url.rstrip("/").split("/")[-2:])
    g = Github(api_key) if api_key else Github()

    remote_repo = g.get_repo(repo_path)
    existing_repo = db.get_existing_repo(url=repo_url)

    default_branch = remote_repo.default_branch
    commits = list(remote_repo.get_commits(os.getenv("GITHUB_API_URL"), sha=default_branch))

    summaries = []
    idx = next((i for i, commit in enumerate(commits) if commit.sha == existing_repo["latest_commit_stored"]), None)

    if idx is None:
        return []
    
    recent_commits_to_process = list(reversed(commits[:idx]))[:MAX_COMMITS]

    for commit in recent_commits_to_process:
        summaries.append(summarize_commit(commit))

    return summaries