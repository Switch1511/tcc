document.addEventListener("DOMContentLoaded", () => {
    function fetchArticles() {
        fetch('/artigos')
            .then(response => response.json())
            .then(articles => {
                const container = document.getElementById('article-container');

                container.innerHTML = '';

                for (let i = 0; i < articles.length; i++) {
                    const article = articles[i];
                    const otherArticlesHTML = `
                         <div class="col-lg-3 col-md-6 mb-4">
                            <div class="card news-card">
                                <img src="./img/img2.jpeg" alt="${article.titulo}">
                                <div class="card-body">
                                    <p class="category">${article.conteudo}</p>
                                    <h5 class="card-title">${article.titulo}</h5>
                                </div>
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