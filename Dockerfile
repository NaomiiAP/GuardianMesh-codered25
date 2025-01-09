# Use Python 3.8 as base image
FROM python:3.8-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    cryptography \
    scikit-learn \
    numpy \
    requests

# Copy the Python script into the container
COPY scriptnew.py .

# Set the entry point for the script
CMD ["python", "-u", "scriptnew.py"]