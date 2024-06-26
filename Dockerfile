# Use Node 18 slim as the base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the contents of the current directory to the working directory
COPY . .

# Run any necessary commands to set up your application
EXPOSE 8000
EXPOSE 27017

RUN npm install


# Specify the command to run when the container starts
CMD [ "npm", "start" ]
