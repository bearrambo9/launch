FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    build-essential \
    ncurses-term \
    && rm -rf /var/lib/apt/lists/*
    
COPY bash.bashrc /etc/bash.bashrc
COPY bash.bashrc /root/.bashrc   

WORKDIR /workspace

CMD ["tail", "-f", "/dev/null"]