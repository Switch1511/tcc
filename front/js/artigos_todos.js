document.addEventListener("DOMContentLoaded", () => {
    function fetchArticles() {
        fetch('/artigos')
            .then(response => response.json())
            .then(articles => {
                const container = document.getElementById('article-container');

                container.innerHTML = '';

                const maxLengthContent = 35;
                const maxLengthTitle = 20;

                for (let i = 0; i < articles.length; i++) {
                    const article = articles[i];
                
                    // Limitar o conteúdo
                    const truncatedContent = article.conteudo.length > maxLengthContent
                        ? article.conteudo.slice(0, maxLengthContent) + '...' // Adiciona '...' se ultrapassar o limite
                        : article.conteudo;
                
                    // Limitar o título
                    const truncatedTitle = article.titulo.length > maxLengthTitle
                        ? article.titulo.slice(0, maxLengthTitle) + '...'
                        : article.titulo;
                
                    const otherArticlesHTML = `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="card news-card">
                                <img src="./img/img2.jpeg" alt="${article.titulo}">
                                <div class="card-body">
                                 <h5 class="card-title">${truncatedTitle}</h5>
                                    <p class="category">${truncatedContent}</p>
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