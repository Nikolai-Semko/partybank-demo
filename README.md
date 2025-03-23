# Azure Portal Deployment Guide 

This guide walks you through deploying the Partybank application and setting up auto-scaling using only the Azure Portal interface, with GitHub integration for deployment.

## Prerequisites

- An Azure account (student account works well)
- A GitHub account with your Partybank code repository
- Basic familiarity with Azure Portal navigation

## Part 1: Creating Resources in Azure Portal

### Step 1: Create a Resource Group

1. Log in to the [Azure Portal](https://portal.azure.com)
2. Search for "Resource groups" in the top search bar
3. Click "+ Create"
4. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource group**: Enter "PartyBankResources"
   - **Region**: Select a region close to you (e.g., East US 2)
5. Click "Review + create", then "Create"

### Step 2: Create an App Service Plan

1. In the Azure Portal search bar, type "App Service Plans" and select it
2. Click "+ Create"
3. Fill in the details:
   - **Subscription**: Select your subscription
   - **Resource Group**: Select "PartyBankResources"
   - **Name**: Enter "PartyBankAppServicePlan"
   - **Operating System**: Select "Linux"
   - **Region**: Same region as your resource group
   - **Pricing Plan**: Click "Change size"
      - Select "Production" tab
      - Choose "P0v3" (Premium v3)
      - Click "Apply"
4. Click "Review + create", then "Create"
5. Wait for deployment to complete

### Step 3: Create the Web App

1. In the Azure Portal search bar, type "App Services" and select it
2. Click "+ Create"
3. Configure the basics:
   - **Subscription**: Select your subscription
   - **Resource Group**: Select "PartyBankResources"
   - **Name**: Enter "partybank-demo" (must be globally unique)
   - **Publish**: Select "Code"
   - **Runtime stack**: Select "Node 20 LTS"
   - **Operating System**: Select "Linux"
   - **Region**: Same region as before
   - **Linux Plan**: Select "PartyBankAppServicePlan"
4. Click "Next: Deployment"
5. Configure GitHub deployment:
   - **Enable continuous deployment**: Yes
   - **GitHub account**: Click "Authorize" and log in
   - **Organization**: Select your GitHub username
   - **Repository**: Select your partybank repository
   - **Branch**: Select "main" (or your default branch)
6. Click "Review + create", then "Create"
7. Wait for deployment to complete

## Part 2: Setting Up Auto-Scaling

1. Navigate to your App Service:
   - Go to "Resource groups"
   - Select "PartyBankResources"
   - Click on your "partybank-demo" app service

2. Configure scaling:
   - In the left menu, under "Settings", select "Scale out (App Service Plan)"
   - Change from "Manual scale" to "Custom autoscale"
   - Fill in the details:
     - **Mode**: Select "Scale based on a metric"
     - **Instance limits**: 
       - Minimum: 1
       - Maximum: 5
       - Default: 1
     - **Name**: Enter "CPU Based Scaling"

3. Add a Scale-Out Rule:
   - Click "Add a rule"
   - Configure the rule:
     - **Metric name**: Select "CPU Percentage"
     - **Operator**: Select "Greater than"
     - **Metric threshold**: Enter "70"
     - **Duration (minutes)**: Enter "5"
     - **Time grain statistic**: Select "Average"
     - **Operation**: Select "Increase count by"
     - **Cool down (minutes)**: Enter "5"
     - **Instance count**: Enter "1"
   - Click "Add"

4. Add a Scale-In Rule:
   - Click "Add a rule" again
   - Configure the rule:
     - **Metric name**: Select "CPU Percentage"
     - **Operator**: Select "Less than"
     - **Metric threshold**: Enter "30"
     - **Duration (minutes)**: Enter "5"
     - **Time grain statistic**: Select "Average"
     - **Operation**: Select "Decrease count by"
     - **Cool down (minutes)**: Enter "5"
     - **Instance count**: Enter "1"
   - Click "Add"
   - Click "Save" at the top

## Part 3: Setting Up Azure Load Testing

1. Create a Load Testing resource:
   - In the search bar, type "Load Testing" and select it
   - Click "+ Create"
   - Fill in the details:
     - **Subscription**: Select your subscription
     - **Resource group**: Select "PartyBankResources"
     - **Name**: Enter "PartyBankLoadTest"
     - **Region**: Select a supported region
   - Click "Review + create", then "Create"

2. Upload a JMeter test script:
   - Navigate to your Load Testing resource
   - Select "Tests" from the left menu
   - Click "+ Create" and select "Upload JMeter script"
   - Configure the test:
     - **Test name**: Enter "PartyBankBasicTest"
     - **Description**: Enter "Load test for Partybank application"
     - **Upload JMeter script file**: Upload your `PartyBankLoadTest.jmx` file
   - Click "Next" and review additional settings
   - Click "Create"

3. Run the load test:
   - From the "Tests" list, select your test
   - Click "Run"
   - Set any additional parameters if needed
   - Click "Run" to start the test

## Part 4: Monitoring and Visualizing Results

### Configure Test Metrics Visualization

1. In your load test results, click "Configure metrics" 
2. Add these important metrics:
   - **HTTP Server Errors** (namespace: microsoft.web-sites)
   - **Requests** (namespace: microsoft.web-sites)
   - **CPU Percentage** (namespace: microsoft.web-serverfarms)
   - **Memory Percentage** (namespace: microsoft.web-serverfarms)
   - **Automatic Scaling Instance Count** (namespace: microsoft.web-sites)

### Configure App Components for Testing

1. In your load test interface, click "App components"
2. Select both:
   - Your web app (partybank-demo)
   - Your App Service Plan (PartyBankAppServicePlan)
3. This will allow you to monitor both the application and the underlying infrastructure

### Create a Custom Dashboard

1. Go to "Dashboard" in the Azure Portal
2. Click "+ New dashboard", then "Blank dashboard"
3. Name it "Partybank Scaling Dashboard"
4. Add metrics tiles for:
   - CPU Percentage
   - Instance Count
   - Memory Usage
   - Request Count
   - Response Time

## Part 5: Generating Load and Demonstrating Scaling

1. Run your load test from Azure Load Testing
2. While the test runs, monitor:
   - The Instance Count in your dashboard
   - CPU Percentage across instances
   - Response times under load

#### For the web application and test to work correctly, the real URL of the deployed site must be added to the app.js and PartyBankLoadTest.jmx files.

This deployment approach demonstrates horizontal scaling (adding more instances) rather than vertical scaling (increasing instance size), aligning with the cloud scalability concepts in our research work.

### To test a web application, you can use the following requests:
**Method**: GET
- **URL**: {{base_url}}/api
- **URL**: {{base_url}}/health
- **URL**: {{base_url}}/api/server-info
- **URL**: {{base_url}}/api/stress-test
- **URL**: {{base_url}}/api/stress-test?duration=1000&intensity=20
- **URL**: {{base_url}}/api/events
- **URL**: {{base_url}}/api/events/1

**Method**: POST
- **URL**: {{base_url}}/api/purchase
- Body:
```json
{
  "eventId": 1,
  "quantity": 2,
  "customerName": "John Doe",
  "email": "john.doe@example.com"
}
```

*Note: The Partybank web application and this Deployment Guide were developed with the assistance of Claude.ai*
