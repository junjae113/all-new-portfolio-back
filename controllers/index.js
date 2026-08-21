const index = (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8")
  res.end("<h1>Hello, Express!😎</h1>")
}

export { index }