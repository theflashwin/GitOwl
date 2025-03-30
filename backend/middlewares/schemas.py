from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class Commit(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    changes: List[str] = Field(...)
    date: datetime = Field(...)
    commit_hash: str = Field(...)

class CommitHistory(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    repo_url: str = Field(...)
    latest_commit_stored: str = Field(...)
    passcode: str = Field(...)
    context: str = Field(...)
    changes: List[Commit] = Field(...)
    date_created: str = Field(...)

class CommitSummaryResponse(BaseModel):
    title: str
    description: str
    important_changes: List[str]

class User(BaseModel):
    user_id: str
    repos: List[str]
