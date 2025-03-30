from celery import Celery

celery_app = Celery(
    "tasks",
    backend="redis://localhost:6379/0",
    broker="redis://localhost:6379/0"
)

from middlewares import processing, db

@celery_app.task(name="summarize_repo_task")
def summarize_repo_task(repo_url: str, api_key: str):
    try:
        summaries = processing.summarize_github_repo(repo_url=repo_url, api_key=api_key)
        db.save_existing_changes(url=repo_url, new_summaries=summaries)
        return True
    except Exception as e:
        print(f"[Task Error] {e}")
        return False