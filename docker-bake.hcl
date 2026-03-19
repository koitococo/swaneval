target "base" {
  context = "./"
  dockerfile = "./Dockerfile"
  output = [ "type=registry" ]
}

target "frontend" {
  inherits = [ "base" ]
  target = "frontend"
  tags = ["registry.ltkk.run/swaneval/frontend:latest"]
}

target "backend" {
  inherits = [ "base" ]
  target = "backend"
  tags = ["registry.ltkk.run/swaneval/backend:latest"]
}

group "default" {
  targets = ["frontend", "backend"]
}