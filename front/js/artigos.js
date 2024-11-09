document.addEventListener("DOMContentLoaded", () => {
    function fetchArticles() {
        fetch('http://localhost:3000/artigos')
            .then(response => response.json())
            .then(articles => {
                const container = document.getElementById('article-container');

                container.innerHTML = '';

                // Artigo em destaque (index 0)
                const featuredArticle = articles[0];
                const featuredHTML = `
                    <div class="col-lg-6 mb-4">
                        <div class="card featured">
                            <a href="artigo.html?id=${featuredArticle.id}"> <!-- Link para a página de detalhes -->
                                <img src="./img/img1.jpeg" alt="${featuredArticle.titulo}" class="img-fluid">
                                <div class="text-overlay">
                                    <p class="category">${featuredArticle.conteudo}</p>
                                    <h5 class="card-title">${featuredArticle.titulo}</h5>
                                </div>
                            </a>
                        </div>
                    </div>
                `;
                container.innerHTML += featuredHTML;

                // Container para os artigos de segundo nível
                const secondColumnHTML = `
                    <div class="col-lg-6 mb-4" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div class="row">
                            <div class="col-md-6 second-card">
                                <a href="artigo.html?id=${articles[1].id}"> <!-- Link para a página de detalhes -->
                                    <img src="./img/img1.jpeg" alt="${articles[1].titulo}" class="img-fluid">
                                </a>
                            </div>
                            <div class="col-md-6">
                                <div class="card-body">
                                    <a href="artigo.html?id=${articles[1].id}"> <!-- Link para a página de detalhes -->
                                        <p class="category">${articles[1].conteudo}</p>
                                        <h5 class="card-title">${articles[1].titulo}</h5>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 second-card">
                                <a href="artigo.html?id=${articles[2].id}"> <!-- Link para a página de detalhes -->
                                    <img src="./img/img1.jpeg" alt="${articles[2].titulo}" class="img-fluid">
                                </a>
                            </div>
                            <div class="col-md-6">
                                <div class="card-body">
                                    <a href="artigo.html?id=${articles[2].id}"> <!-- Link para a página de detalhes -->
                                        <p class="category">${articles[2].conteudo}</p>
                                        <h5 class="card-title">${articles[2].titulo}</h5>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                container.innerHTML += secondColumnHTML;

                // Adiciona os outros artigos
                for (let i = 3; i < articles.length; i++) {
                    const article = articles[i];
                    const otherArticlesHTML = `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="card news-card">
                                <a href="artigo.html?id=${article.id}"> <!-- Link para a página de detalhes -->
                                    <img src="./img/img1.jpeg" alt="${article.titulo}">
                                    <div class="card-body">
                                        <p class="category">${article.conteudo}</p>
                                        <h5 class="card-title">${article.titulo}</h5>
                                    </div>
                                </a>
                            </div>
                        </div>
                    `;
                    container.innerHTML += otherArticlesHTML;
                }
            })
            .catch(error => {
                console.error("Erro ao buscar artigos:", error);
            });
    }

    fetchArticles();
});