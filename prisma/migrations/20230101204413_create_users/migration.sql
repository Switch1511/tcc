-- CreateTable
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ultima_atualizacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
)

CREATE TABLE `artigos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `titulo` VARCHAR(255) NOT NULL,
  `conteudo` TEXT NOT NULL,
  `autor_id` INT NOT NULL,
  `data_publicacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `ultima_atualizacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `publicado` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  INDEX `autor_id` (`autor_id` ASC) VISIBLE,
  CONSTRAINT `artigos_ibfk_1`
    FOREIGN KEY (`autor_id`)
    REFERENCES `conecta_pinhais`.`usuarios` (`id`)
    ON DELETE CASCADE)
