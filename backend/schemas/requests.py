from pydantic import BaseModel, Field
from typing import List

class EditCommitTitleRequest(BaseModel):
    repo_url: str
    commit_hash: str
    new_title: str

class EditCommitDescriptionRequest(BaseModel):
    repo_url: str
    commit_hash: str
    new_description: str

class EditCommitBulletDescription(BaseModel):
    repo_url: str
    commit_hash: str
    new_bullet: str
    index: int

class EditRepoTitleRequest(BaseModel):
    repo_url: str
    new_title: str

class EditRepoDescriptionRequest(BaseModel):
    repo_url: str
    new_description: str