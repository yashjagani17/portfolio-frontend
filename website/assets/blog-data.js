// ═══════════════════════════════════════════════
//  BLOG-DATA.JS — Single source of truth for posts
//  Add/edit posts here; index.html and blog.html
//  both pull from this array automatically.
// ═══════════════════════════════════════════════

window.BLOG_POSTS = [
  {
    id:      'zero-trust',
    title:   'Zero Trust on a Budget: CloudFront + Custom Headers',
    date:    'May 2025',
    readTime:'6 min read',
    tag:     'AWS',
    excerpt: 'How I secured an ECS Fargate backend without an API Gateway using CloudFront header validation and private subnet isolation.',
    body: `
      <h3>The problem</h3>
      <p>When building the FastAPI Weather Dashboard, I needed to expose a backend running in ECS Fargate without spending on API Gateway. The typical approach adds cost and latency — but there's a cleaner way.</p>

      <h3>The architecture</h3>
      <p>The backend lives in <strong>private subnets</strong> — it has no public IP and no direct internet route. An Application Load Balancer sits in public subnets and forwards traffic to Fargate tasks. So far, nothing unusual.</p>
      <p>The trick: CloudFront is the <em>only</em> allowed origin. The ALB's security group only allows inbound traffic from CloudFront IP ranges. But IP ranges alone aren't enough — they change, and anyone can route through CloudFront.</p>

      <h3>Custom header validation</h3>
      <p>CloudFront injects a custom header (<code>X-Origin-Verify</code>) with a secret value into every request. The ALB listener checks for this header using a WAF rule. Requests without it are rejected at the edge — the backend never sees them.</p>

      <pre>resource "aws_lb_listener_rule" "origin_verify" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 1

  condition {
    http_header {
      http_header_name = "X-Origin-Verify"
      values           = [var.cloudfront_secret]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fargate.arn
  }
}</pre>

      <h3>Why this matters</h3>
      <ul>
        <li>No public IPs on any Fargate task — the attack surface is minimal</li>
        <li>CloudFront handles TLS, caching, and DDoS mitigation for free</li>
        <li>Total cost: ~$0.01/day at low traffic vs API Gateway's per-request pricing</li>
      </ul>

      <h3>Storing the secret</h3>
      <p>The header value lives in AWS SSM Parameter Store (SecureString), rotated via a Lambda on a schedule. Terraform reads it at apply time and never hardcodes it in state.</p>
    `
  },
  {
    id:      'devsecops-pipeline',
    title:   'Building a DevSecOps Pipeline: Trivy, GKE, and Grafana',
    date:    'Apr 2025',
    readTime:'8 min read',
    tag:     'DevSecOps',
    excerpt: 'A walkthrough of integrating container vulnerability scanning directly into a GitHub Actions workflow before any image reaches production.',
    body: `
      <h3>Shifting security left</h3>
      <p>The DevSecOps Flask project was my attempt to treat security as a pipeline stage, not an afterthought. The goal: catch container vulnerabilities before any image is pushed to the registry, let alone deployed to Kubernetes.</p>

      <h3>The pipeline stages</h3>
      <ul>
        <li><strong>Build:</strong> Docker image built from the Flask app</li>
        <li><strong>Scan:</strong> Trivy runs against the local image, failing the pipeline on HIGH/CRITICAL CVEs</li>
        <li><strong>Push:</strong> Only clean images are pushed to Google Container Registry</li>
        <li><strong>Deploy:</strong> Terraform applies GKE manifest changes</li>
      </ul>

      <pre>- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: gcr.io/\${{ env.PROJECT_ID }}/$\{{ env.IMAGE }}:$\{{ github.sha }}
    format: table
    exit-code: '1'
    severity: HIGH,CRITICAL</pre>

      <h3>Observability with Prometheus + Grafana</h3>
      <p>Once running on GKE, the cluster exposes metrics via kube-state-metrics and node-exporter. Prometheus scrapes these every 15 seconds. Grafana dashboards show pod restarts, CPU throttling, and memory pressure at a glance.</p>
      <p>The most useful alert: <code>KubePodCrashLooping</code> — fires when a pod has restarted more than 5 times in 10 minutes, which usually signals a broken container image that slipped through.</p>

      <h3>Lessons learnt</h3>
      <ul>
        <li>Trivy's <code>--ignore-unfixed</code> flag helps reduce noise from CVEs with no upstream fix</li>
        <li>Always pin your base images — <code>python:3.11-slim</code> is not the same image month-to-month</li>
        <li>Grafana's alerting (now unified) can fire directly into Slack with a simple webhook</li>
      </ul>
    `
  },
  {
    id:      'terraform-multiaz',
    title:   'Terraform Multi-AZ VPC: Patterns I Keep Coming Back To',
    date:    'Mar 2025',
    readTime:'5 min read',
    tag:     'Terraform',
    excerpt: 'The reusable VPC patterns I\'ve settled on after building infrastructure for multiple projects — from module structure to subnet CIDR maths.',
    body: `
      <h3>Why the same VPC every time?</h3>
      <p>Every AWS project I build ends up with roughly the same VPC shape: 2 public subnets, 2 private subnets, a NAT Gateway, and an Internet Gateway. Rather than copy-pasting, I've extracted this into a reusable module.</p>

      <h3>The CIDR pattern</h3>
      <p>I use a /16 for the VPC and <code>cidrsubnet()</code> to slice it automatically. This avoids manual calculation and keeps the module generic:</p>

      <pre>locals {
  public_cidrs  = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i)]
  private_cidrs = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i + 10)]
}</pre>

      <p>With <code>vpc_cidr = "10.0.0.0/16"</code>, this gives public subnets at <code>10.0.0.0/24</code> and <code>10.0.1.0/24</code>, and private at <code>10.0.10.0/24</code> and <code>10.0.11.0/24</code>.</p>

      <h3>NAT Gateway placement</h3>
      <p>I only provision NAT in one AZ by default — it's the biggest cost saving for dev/staging environments. The variable <code>single_nat_gateway</code> (default <code>true</code>) controls this. Production flips it to <code>false</code>.</p>

      <h3>Module outputs that actually help</h3>
      <ul>
        <li><code>vpc_id</code> — for security groups and peering</li>
        <li><code>private_subnet_ids</code> — for ECS, RDS, Lambda</li>
        <li><code>public_subnet_ids</code> — for ALBs and NAT</li>
        <li><code>nat_gateway_ips</code> — for external IP allowlisting</li>
      </ul>

      <h3>One thing I always forget</h3>
      <p>Lambda functions in a VPC need <code>AWSLambdaVPCAccessExecutionRole</code> on their execution role — otherwise they silently fail to attach to the ENI and you get confusing timeout errors. Add it to the module's IAM outputs.</p>
    `
  }
];