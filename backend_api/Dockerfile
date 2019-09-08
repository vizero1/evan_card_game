FROM node:10

# Install app dependencies
COPY package.json /www/package.json
COPY package-lock.json /www/package-lock.json
RUN cd /www; npm install

# Copy app source
COPY . /www

# Set work directory to /www
WORKDIR /www

# set your port
ENV PORT 8080

# expose the port to outside world
EXPOSE  8080

# start command as per package.json
CMD ["npm", "start"]
