app.post("/salvar", async (req, res) => {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain" // 🔥 ESSA LINHA RESOLVE
      },
      body: JSON.stringify(req.body)
    });

    const text = await response.text();

    res.json({
      status: "ok",
      retorno: text
    });

  } catch (error) {
    res.status(500).json({
      status: "erro",
      mensagem: error.message
    });
  }
});
