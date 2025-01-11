# Use Python 3.8 as base image
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Copy the Python script into the container
COPY scriptnew.py .

# Install any dependencies (if you have any)
RUN pip install --no-cache-dir requests

# Set the entry point for the script
CMD ["python", "-u", "scriptnew.py"]
