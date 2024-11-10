document.addEventListener("DOMContentLoaded", () => {
    function fetchArticles() {
        fetch('/artigos')
            .then(response => response.json())
            .then(articles => {
                const container = document.getElementById('article-container');

                container.innerHTML = '';

                const maxLengthContent = 55;
                const maxLengthTitle = 20;

                // Artigo em destaque (index 0)
                const featuredArticle = articles[0];
                
                // Limitar o conteúdo
                const truncatedContent = featuredArticle.conteudo.length > maxLengthContent
                    ? featuredArticle.conteudo.slice(0, maxLengthContent) + '...' // Adiciona '...' se ultrapassar o limite
                    : featuredArticle.conteudo;
            
                // Limitar o título
                const truncatedTitle = featuredArticle.titulo.length > maxLengthTitle
                    ? featuredArticle.titulo.slice(0, maxLengthTitle) + '...'
                    : featuredArticle.titulo;

                const featuredHTML = `
                    <div class="col-lg-6 mb-4">
                        <div class="card featured">
                            <a href="artigo.html?id=${featuredArticle.id}"> <!-- Link para a página de detalhes -->
                                <img src="./img/img1.jpeg" alt="${featuredArticle.titulo}" class="img-fluid">
                                <div class="text-overlay">
                                    <h5 class="card-title">${truncatedTitle}</h5>
                                    <p class="category">${truncatedContent}</p>
                             
                                </div>
                            </a>
                        </div>
                    </div>
                `;
                container.innerHTML += featuredHTML;

                // Container para os artigos de segundo nível
                if (articles[1] && articles[2]) { // Verifica se os índices 1 e 2 existem
                    const featuredArticle = articles[1];
                    const featuredArticle2 = articles[2];

                    const truncatedContent = featuredArticle.conteudo.length > maxLengthContent
                        ? featuredArticle.conteudo.slice(0, maxLengthContent) + '...'
                        : featuredArticle.conteudo;
                
                    const truncatedTitle = featuredArticle.titulo.length > maxLengthTitle
                        ? featuredArticle.titulo.slice(0, maxLengthTitle) + '...'
                        : featuredArticle.titulo;


            
                    const truncatedContent2 = featuredArticle2.conteudo.length > maxLengthContent
                        ? featuredArticle2.conteudo.slice(0, maxLengthContent) + '...'
                        : featuredArticle2.conteudo;
                
                    const truncatedTitle2 = featuredArticle2.titulo.length > maxLengthTitle
                        ? featuredArticle2.titulo.slice(0, maxLengthTitle) + '...'
                        : featuredArticle2.titulo;

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
                                            <h5 class="card-title">${truncatedTitle}</h5>
                                            <p class="category">${truncatedContent}</p>
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
                                            <h5 class="card-title">${truncatedTitle2}</h5>
                                            <p class="category">${truncatedContent2}</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += secondColumnHTML;
                } else if (articles[1]) {
                    const featuredArticle = articles[1];
                
                    const truncatedContent = featuredArticle.conteudo.length > maxLengthContent
                        ? featuredArticle.conteudo.slice(0, maxLengthContent) + '...'
                        : featuredArticle.conteudo;
                
                    const truncatedTitle = featuredArticle.titulo.length > maxLengthTitle
                        ? featuredArticle.titulo.slice(0, maxLengthTitle) + '...'
                        : featuredArticle.titulo;

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
                                            <h5 class="card-title">${truncatedTitle}</h5>
                                            <p class="category">${truncatedContent}</p>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    container.innerHTML += secondColumnHTML;
                }

                // Adiciona os outros artigos
                for (let i = 3; i < articles.length; i++) {
                    const article = articles[i];
                
         
                    const truncatedContent = article.conteudo.length > maxLengthContent
                        ? article.conteudo.slice(0, maxLengthContent) + '...' // Adiciona '...' se ultrapassar o limite
                        : article.conteudo;
                
          
                    const truncatedTitle = article.titulo.length > maxLengthTitle
                        ? article.titulo.slice(0, maxLengthTitle) + '...'
                        : article.titulo;

                    const otherArticlesHTML = `
                        <div class="col-lg-3 col-md-6 mb-4">
                            <div class="card news-card">
                                <a href="artigo.html?id=${article.id}"> <!-- Link para a página de detalhes -->
                                    <img src="./img/img1.jpeg" alt="${article.titulo}">
                                    <div class="card-body">
                                        <h5 class="card-title">${truncatedTitle}</h5>
                                        <p class="category">${truncatedContent}</p>
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