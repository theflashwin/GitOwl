from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Dict
from datetime import datetime

class Commit(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    changes: List[str] = Field(...)
    date: datetime = Field(...)
    commit_hash: str = Field(...)

class RepoStates(Enum):
    PROCESSING = 1
    READY = 2

class UserStates(Enum):
    OWNER = 1

class User(BaseModel):
    user_id: str
    repos: List[str]

class CommitHistory(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    repo_url: str = Field(...)
    latest_commit_stored: str = Field(...)
    passcode: str = Field(...)
    context: str = Field(...)
    changes: List[Commit] = Field(...)
    date_created: str = Field(...)
    state: RepoStates = Field(...)
    users: Dict[str, int] = Field(...)

class CommitSummaryResponse(BaseModel):
    title: str
    description: str
    important_changes: List[str]
