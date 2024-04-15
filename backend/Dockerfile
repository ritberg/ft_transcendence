FROM python:3.11-slim

# working directory
WORKDIR /app

# copy the requirements file
COPY requirements.txt .

# install the dependencies
RUN pip install -r requirements.txt

# copy the content of the local src directory to the working directory
COPY /src .

# port number the container should expose
EXPOSE 8000

# command to run on container start
CMD ["gunicorn", "--workers=5" "--bind", "0.0.0.0:8000", "transcendance.wsgi:application"]
