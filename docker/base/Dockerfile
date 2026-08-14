FROM ubuntu:26.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install "-y" \
    curl \
    git \
    ca-certificates \
    build-essential \
    ncurses-term \
    python3 \
    python3-pip \
    && curl "-fsSL" https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install "-y" nodejs \
    && npm install "-g" tsx typescript \
    && rm "-rf" /var/lib/apt/lists/*
    
COPY bash.bashrc /etc/bash.bashrc
COPY bash.bashrc /root/.bashrc   

WORKDIR /workspace

CMD ["tail", "-f", "/dev/null"]