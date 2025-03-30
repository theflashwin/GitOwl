# GitOwl

Keep a watchful eye on your Git repositories with GitOwl.

## How to Run Locally

First, set the OpenAI API Key

```bash
export OPENAI_API_KEY = [YOUR API KEY]
```

Now, open two seperate terminal instances. In the first:

```bash
cd backend
uvicorn server:app --reload
```

Then, in a seperate terminal instance:

```bash
cd backend
celery -A tasks.celery_app worker --loglevel=info
```

Then, in the second instance:

```bash
cd client
npm run dev
```

Now, navigate to `localhost:5173` or something similar (if you have something running on port 5173 vite just increments until it finds a free port) and see the application in action!

## Design Decisions

### Tech Stack

The frontend of this application is built using React + Vite. I chose this mainly because of my extensive experience with it, but also because of its modularity. Further, it tends to work beautifully with TailwindCSS, which is what I used mainly in this project.

The backend of this project is built using FastAPI, a python library. This was the first time I have built something using a python-based backend framework, but there are two main reasons why I chose this:

First, one of the future enhancements I would like to make to this project is to make the LLM better, and faster, at summarizing the files. To do this, we could utillize LLM fine-tuning, and I knew that this would be easier via python. Further, there is a lot of documentation and examples on the internet using python as the language of choice for interacting with the OpenAI API. This is why I chose python as the language of choice.

Second, I knew the API itself would be relatively simple, something I wanted by design. So, I thought FastAPI would be the perfect choice for this, with its ease of use and its simple interface. However, I noticed that the summarization task would take a very long time, and the user was stuck on the loading page for a very, very long time. Thus, I used Celery and Redis to make the actual summarization a background task.

The backend database is MongoDB. I could lie and say this is because of its fantastic interface, easy-to-use API, and NoSQL approach, but honestly its because its the DB I have the most experience with and the one I find the simplest to set up and use.

### Functionality

I ran into many major roadblocks during the project, specifically how to efficiently summarize the repository given repositories can be thousands of lines in length. Given the limited context window for each API call, I had to make my code adaptible to repositories of any length. 

In the beginning, my code relied on an approach in which we cloned the entire remote repository to the local file system, and summarizing the commits by passing in all of the file differences. However, there are two major drawbacks to this approach:

1. If the repository is very large (*cough cough* cromium), and we are running our backend code on an container instance (like kubernetes or ec2) with limited storage space, we can easily break the instance. Further, if our backend charges us for storage space, this is clearly a problem.

2. If the total file difference is larger than the allowed token length, we will error out. A workaround is to clip the file difference, but we could easily ignore very important information, leading to worse output.

The final solution I settled upon is to summarize file differences file by file (hopefully avoiding the limited token length). We take those short summaries and generate one large summary for the entire commit.

## Future Enhancements

1. Adding functionality to actually edit the changelog - I am in the process of adding this, I know how to but I want to interface to be pretty and simplistic, and haven't really found a good approach on how to do this
2. Security - adding the ability for pages to be public, private, etc... 
3. User Accounts - my plan is to allow three free changelogs per account, and then have a paid tier for unlimited. Also, this will help users remember and keep track of the repositories they've edited {DONE}

## Apology

This project is very exciting for me, but unfortunately OS, Abstract algebra, Deep Learning, etc is killing me and I haven't had time to meaninfully add the above features. However, I plan to add the above over the next week. Just wanted to give a quick update as to where I am.