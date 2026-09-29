FROM ubuntu:22.04


ENV ROS_DISTRO=humble

# --------------------------------
# Install basic tools
# --------------------------------
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    gnupg2 \
    lsb-release \
    ca-certificates \
    build-essential \
    python3 \
    python3-pip \
    python3-flask \
    python3-pymongo \
    python3-opencv \
    python3-yaml \
    libusb-1.0-0-dev \
    nano \
    vim \
    htop \
    net-tools \
    tree \
    iputils-ping \
    lsof \
    usbutils \
    software-properties-common \
    nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------
# Add ROS 2 repository
# --------------------------------
RUN apt-get update && apt-get install -y \
    software-properties-common \
    && add-apt-repository universe

RUN curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key \
    -o /usr/share/keyrings/ros-archive-keyring.gpg

RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" \
    > /etc/apt/sources.list.d/ros2.list

# --------------------------------
# Install ROS 2 Humble
# --------------------------------
RUN apt-get update && apt-get install -y \
    ros-humble-ros-base \
    ros-humble-rosbridge-server \
    python3-rosdep \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------
# ROS 2 environment
# --------------------------------
RUN echo "source /opt/ros/humble/setup.bash" >> /root/.bashrc

# --------------------------------
# Python packages
# --------------------------------
RUN pip3 install --no-cache-dir -U \
    colcon-common-extensions \
    redis \
    rospkg \
    pyyaml \
    pymodbus \
    opcua

# --------------------------------
# Node.js
# --------------------------------
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# --------------------------------
# Node ROS packages
# --------------------------------
RUN npm install -g \
    roslib \
    js-yaml \
    node-opcua

# --------------------------------
# React application
# --------------------------------
WORKDIR /app

COPY build/ /var/www/html/

# --------------------------------
# Nginx
# --------------------------------
RUN rm -f /etc/nginx/sites-enabled/default

COPY nginx.conf /etc/nginx/sites-enabled/default

EXPOSE 80
EXPOSE 9090
EXPOSE 3000
EXPOSE 5000

CMD ["nginx", "-g", "daemon off;"]
