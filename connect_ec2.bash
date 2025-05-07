#!/bin/bash

# Absolute path to the PEM file
PEM_FILE="/home/ata/projects/SmsAI/smsai.pem"

# EC2 instance hostname
EC2_HOST="ec2-52-29-62-160.eu-central-1.compute.amazonaws.com"

# SSH command
ssh -i "$PEM_FILE" ec2-user@"$EC2_HOST"


# chmod +x /home/ata/projects/SmsAI/connect_ec2.bash
# alias connect_ec2="/home/ata/projects/SmsAI/connect_ec2.bash"