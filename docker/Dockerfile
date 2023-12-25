FROM nginx 
MAINTAINER lxj

ADD ./dist /app/dist/
RUN rm -rf /etc/nginx/conf.d/default.conf
ADD ./nginx.conf /etc/nginx/conf.d/ 
EXPOSE 80

