from celery import Celery
from typing import Optional

from dotenv import load_dotenv
import os

load_dotenv()

celery_app = Celery(
    "tasks",
    backend=os.getenv("CELERY_BROKER_URL"),
    broker=os.getenv("CELERY_BROKER_URL")
)

from middlewares import processing, db, schemas

@celery_app.task(name="summarize_repo_task")
def summarize_repo_task(repo_url: str, api_key: Optional[str]):
    try:
        db.set_state(repo_url=repo_url, state=schemas.RepoStates.PROCESSING)
        summaries = processing.summarize_github_repo(repo_url=repo_url, api_key=api_key)
        db.save_existing_changes(url=repo_url, new_summaries=summaries)
        db.set_state(repo_url=repo_url, state=schemas.RepoStates.READY)
        return True
    except Exception as e:
        print(f"[Task Error] {e}")
        return False
    
@celery_app.task(name="update_summaries_task")
def update_summaries_task(repo_url: str, api_key: Optional[str]):
    try:
        # first, fetch updated summaries
        new_summaries = processing.update_existing_repo(repo_url=repo_url, api_key=api_key)

        # second, push these to the database
        db.save_existing_changes(url=repo_url, new_summaries=new_summaries)

        # finally, reset the state
        db.set_state(repo_url=repo_url, state=schemas.RepoStates.READY)

        return True
    except Exception as e:
        print(e)
        return False