// ═══════════════════════════════════════════════
//  BLOG-DATA.JS — Single source of truth for posts
//  Add/edit posts here; index.html and blog.html
//  both pull from this array automatically.
//  Posts appear newest-first (top of array = latest).
// ═══════════════════════════════════════════════

window.BLOG_POSTS = [
  {
    id:      'weather-api',
    title:   'Building a Weather API with Lambda, API Gateway, and Terraform',
    date:    'May 2025',
    readTime:'7 min read',
    tag:     'AWS',
    excerpt: 'How I built and deployed a serverless weather API from scratch — the code, the Terraform, and the problems that took way too long to debug.',
    body: `
      <p>This post is about the weather API that powers the demo on this site. It started as a straightforward project — call OpenWeatherMap, return a forecast — and turned into a proper lesson in serverless architecture, IAM permissions, and the kind of bugs that only appear in production.</p>

      <h3>The basic idea</h3>
      <p>A Lambda function receives a city name, fetches a 3-day forecast from OpenWeatherMap, and returns clean JSON. API Gateway exposes it over HTTPS. Simple enough on paper.</p>
      <p>The API key lives in <strong>SSM Parameter Store</strong> as a SecureString. The Lambda retrieves and caches it on cold start — no environment variables, no hardcoded secrets, no keys in the Terraform state file.</p>

      <pre>def get_api_key():
    global api_key
    if api_key is None:
        api_key = ssm.get_parameter(
            Name="/weather-dashboard/openweathermap-api-key",
            WithDecryption=True
        )["Parameter"]["Value"]
    return api_key</pre>

      <h3>Terraform for the infrastructure</h3>
      <p>Everything is declared in Terraform: the Lambda function, its IAM role, the API Gateway REST API, the stage, and the SSM parameter (value injected via a <code>tfvars</code> file that's gitignored). One <code>terraform apply</code> and it's live.</p>
      <p>The IAM role was where I spent the most time. Lambda needs <code>ssm:GetParameter</code> on the specific parameter ARN — not <code>*</code>, not the whole path. Scoping it correctly meant the function fails fast with a clear error if the parameter name is wrong, rather than silently returning nothing.</p>

      <h3>Problems I actually ran into</h3>
      <p><strong>CORS.</strong> The Lambda returns CORS headers, but I'd scoped <code>Access-Control-Allow-Origin</code> to my production domain. Every local test returned nothing — no error message, just an empty response in the browser. The fix was obvious in hindsight, but it took an embarrassing amount of time to realise the browser was silently swallowing the blocked response.</p>
      <p><strong>The request body.</strong> I'd initially set up the endpoint to accept a query parameter (<code>?city=London</code>), then switched to a POST with a JSON body partway through — and forgot to update the client-side fetch call. The Lambda was receiving <code>null</code> for the city and defaulting to London every time, which worked fine until I tested with a different city.</p>
      <p><strong>Cold starts and SSM latency.</strong> The first request after a period of inactivity was noticeably slow — around 800ms. Caching the API key in a global variable (as shown above) brought subsequent calls down to under 100ms. Not a fix for cold starts, but it helps.</p>

      <h3>What I'd do differently</h3>
      <p>For a production service I'd add a caching layer — either ElastiCache or a DynamoDB TTL table — so repeated requests for the same city don't hit OpenWeatherMap every time. I'd also separate the API key retrieval into its own Lambda layer so it can be reused across functions. But for a personal portfolio demo, the current setup is clean and costs essentially nothing.</p>
    `
  },
  {
    id:      'aws-ccp',
    title:   'Passing the AWS Certified Cloud Practitioner',
    date:    'May 2025',
    readTime:'5 min read',
    tag:     'Certifications',
    excerpt: 'How AWS re/Start prepared me for the exam, what actually helped, and what I wish I\'d focused on earlier.',
    body: `
      <p>I passed the AWS Certified Cloud Practitioner (CLF-C02) in May 2025, a few weeks after finishing the re/Start programme. This isn't a study guide — there are plenty of those — it's more about what the actual preparation process looked like for me and what made the difference.</p>

      <h3>How re/Start prepared me</h3>
      <p>The honest answer is: more than I expected. The programme covers a lot of the same ground as the CCP exam — compute, storage, networking, IAM, databases, the shared responsibility model — but it teaches them through hands-on labs rather than slide decks. By the time I sat the exam, I wasn't memorising definitions. I was recalling things I'd actually built.</p>
      <p>That said, re/Start doesn't map perfectly to the exam. The programme goes deeper on some topics (EC2, VPC, CLI) and barely touches others that carry real exam weight, like billing, support plans, and the AWS Well-Architected Framework. Those needed dedicated revision.</p>

      <h3>What actually helped</h3>
      <p>Building things. Every service I'd spun up — even briefly — was a service I could answer questions about confidently. When a question asked about the difference between Security Groups and NACLs, I wasn't trying to remember a table. I was thinking about the VPCs I'd configured.</p>
      <p>Mock exams were the other big one. Not to memorise answers, but to get comfortable with the question style. AWS exam questions often hinge on a single word — "most cost-effective," "least operational overhead," "in accordance with the shared responsibility model." Practising that pattern of reading matters.</p>

      <h3>What I'd focus on earlier</h3>
      <p>The pricing and billing section. It's easy to deprioritise because it feels less technical, but it's a meaningful chunk of the exam and the questions are very specific — the difference between Reserved Instances and Savings Plans, when Spot makes sense, what's included in the free tier. Worth more attention than it gets in most study plans.</p>

      <h3>What's next</h3>
      <p>The Solutions Architect Associate (SAA-C03), which I've since passed. The CCP was a good foundation, but the SAA is where things get genuinely interesting — multi-tier architectures, failover strategies, the kind of design decisions that actually come up in real cloud work.</p>
    `
  },
  {
    id:      'aws-restart',
    title:   'Six Weeks on AWS re/Start: What It\'s Actually Like',
    date:    'May 2026',
    readTime:'6 min read',
    tag:     'Career',
    excerpt: 'An honest account of the AWS re/Start bootcamp — what we covered, the people I met, and what surprised me about the experience.',
    body: `
      <p>I enrolled in the AWS re/Start bootcamp in January 2026 and after an intensive four months, graduated in May 2026. Before starting, I'd looked for honest accounts of what the programme is actually like day-to-day and hadn't found many. This is my attempt to fill that gap.</p>

      <h3>What we covered</h3>
      <p>The curriculum is broader than I expected. The first weeks are foundational — how the internet works, what cloud computing actually means, the basics of Linux and the command line. If you're coming from a technical background some of this will feel slow, but it's worth paying attention to. The fundamentals matter more than they seem to at first.</p>
      <p>From there it builds into the core AWS services: compute (EC2, Lambda), storage (S3, EBS), networking (VPC, subnets, security groups, routing), databases (RDS, DynamoDB), and IAM. Each topic is paired with hands-on labs in real AWS accounts — not simulators. You're clicking through the console and writing CLI commands against actual infrastructure.</p>
      <p>The last section covers security, compliance, pricing, and the cloud architecture principles that underpin the CCP exam. By the end, you have a working knowledge of the AWS ecosystem that's broad enough to be genuinely useful.</p>

      <h3>The people</h3>
      <p>This was the part I underestimated most. re/Start attracts people from genuinely all walks of life — career changers, recent graduates, people returning to work after years away, people from completely non-technical backgrounds. The mix makes for better conversations than you'd get in a room full of CS graduates, and the shared experience of learning something new creates a level of openness that's hard to manufacture.</p>
      <p>Several people I met are now working in cloud roles. A few are studying for their next certifications. Staying in touch with that cohort has been one of the more underrated outcomes of the programme.</p>

      <h3>What surprised me</h3>
      <p>How quickly it moved once the foundational weeks were done. The pace in the networking and security modules felt like drinking from a fire hose at times. The labs help, but there's a real difference between following a lab guide and being able to design something from scratch. I filled that gap by building outside of class — the weather API, small automation scripts, anything to get more reps.</p>
      <p>The graduation itself was a proper milestone. There's something concrete about finishing a structured programme with people who started alongside you. It made the subsequent certification feel less like an isolated exam and more like the next step in something already in motion.</p>

      <h3>Would I recommend it?</h3>
      <p>Yes, with the caveat that you get out what you put in. The programme gives you a foundation and a community. What you build on top of that is up to you. If you treat it as a passive course, you'll leave with a certificate. If you treat it as a launchpad and keep building, it's a genuinely useful start to a cloud career.</p>
    `
  },
  {
    id:      'zero-trust',
    title:   'Zero Trust on a Budget: CloudFront + Custom Headers',
    date:    'May 2025',
    readTime:'6 min read',
    tag:     'AWS',
    excerpt: 'How I secured an ECS Fargate backend without an API Gateway using CloudFront header validation and private subnet isolation.',
    body: `
      <p>When building the FastAPI Weather Dashboard, I needed to expose a backend running in ECS Fargate without spending on API Gateway. The typical approach adds cost and latency — but there's a cleaner way.</p>

      <h3>The architecture</h3>
      <p>The backend lives in <strong>private subnets</strong> — it has no public IP and no direct internet route. An Application Load Balancer sits in public subnets and forwards traffic to Fargate tasks. So far, nothing unusual.</p>
      <p>The trick: CloudFront is the only allowed origin. The ALB's security group only allows inbound traffic from CloudFront IP ranges. But IP ranges alone aren't enough — they change, and anyone can route through CloudFront.</p>

      <h3>Custom header validation</h3>
      <p>CloudFront injects a custom header (<code>X-Origin-Verify</code>) with a secret value into every request. The ALB listener rule rejects anything missing it — the backend never sees unauthenticated traffic.</p>

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
      <p>No public IPs on any Fargate task. CloudFront handles TLS, caching, and DDoS mitigation. The header value lives in SSM Parameter Store (SecureString) and is never hardcoded in Terraform state. The total cost at low traffic is roughly $0.01/day — a fraction of API Gateway's per-request pricing.</p>
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
      <p>The DevSecOps Flask project was my attempt to treat security as a pipeline stage, not an afterthought. The goal: catch container vulnerabilities before any image is pushed to the registry, let alone deployed to Kubernetes.</p>

      <h3>The pipeline stages</h3>
      <ul>
        <li><strong>Build:</strong> Docker image built from the Flask app</li>
        <li><strong>Scan:</strong> Trivy runs against the local image, failing the pipeline on HIGH/CRITICAL CVEs</li>
        <li><strong>Push:</strong> Only clean images reach Google Container Registry</li>
        <li><strong>Deploy:</strong> Terraform applies GKE manifest changes</li>
      </ul>

      <pre>- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: gcr.io/$\{{ env.PROJECT_ID }}/$\{{ env.IMAGE }}:\${{ github.sha }}
    format: table
    exit-code: '1'
    severity: HIGH,CRITICAL</pre>

      <h3>Observability with Prometheus + Grafana</h3>
      <p>Once running on GKE, the cluster exposes metrics via kube-state-metrics and node-exporter. Prometheus scrapes these every 15 seconds. The most useful alert: <code>KubePodCrashLooping</code> — fires when a pod has restarted more than 5 times in 10 minutes, which usually signals a broken image that slipped through scanning.</p>

      <h3>Lessons learnt</h3>
      <ul>
        <li>Trivy's <code>--ignore-unfixed</code> flag reduces noise from CVEs with no upstream fix</li>
        <li>Pin base images to a specific SHA256 digest — <code>python:3.11-slim</code> is not the same image month-to-month</li>
        <li>Grafana alerting can fire directly into Slack with a simple webhook — worth setting up early</li>
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
      <p>Every AWS project I build ends up with roughly the same VPC shape: 2 public subnets, 2 private subnets, a NAT Gateway, and an Internet Gateway. Rather than copy-pasting, I've extracted this into a reusable Terraform module.</p>

      <h3>The CIDR pattern</h3>
      <p>I use a /16 for the VPC and <code>cidrsubnet()</code> to slice it automatically. This avoids manual calculation and keeps the module generic:</p>

      <pre>locals {
  public_cidrs  = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i)]
  private_cidrs = [for i in range(2) : cidrsubnet(var.vpc_cidr, 8, i + 10)]
}</pre>

      <h3>NAT Gateway placement</h3>
      <p>I only provision NAT in one AZ by default — the biggest cost saving for dev/staging. A <code>single_nat_gateway</code> variable (default <code>true</code>) controls this. Production flips it to <code>false</code> for true AZ independence.</p>

      <h3>One thing I always forget</h3>
      <p>Lambda functions in a VPC need <code>AWSLambdaVPCAccessExecutionRole</code> on their execution role — otherwise they silently fail to attach to the ENI. Add it to the module's IAM outputs so it's never an afterthought.</p>
    `
  }
];