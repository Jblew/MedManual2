/**
WARNING: DEPRECATED TABLE SCHEME. CURREMTLY USED: tables2.sql
**/

ALTER DATABASE medmanual2 CHARACTER SET utf8 COLLATE utf8_general_ci;


CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    password VARCHAR(255),
    role VARCHAR(20),
    created DATETIME DEFAULT NULL,
    modified DATETIME DEFAULT NULL
);

CREATE TABLE pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT,
    title VARCHAR (255) NOT NULL UNIQUE,
    body LONGTEXT,
    user_id INT NOT NULL,
    version_date DATETIME DEFAULT NULL
);

CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(255) UNIQUE,
    article_id INT UNSIGNED
);

ALTER TABLE users CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE pages CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE tags CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;


##get_path function

DELIMITER $$
CREATE PROCEDURE get_path_procedure(
    IN page_id INT,
    IN children_path VARCHAR (253),
    OUT my_path VARCHAR(255)
)
BEGIN
    IF page_id = 1 THEN
        SET my_path = CONCAT((SELECT title FROM pages WHERE id=page_id), '$$$', children_path);
    ELSE
        CALL get_path_procedure((SELECT parent_id FROM pages WHERE id=page_id), CONCAT((SELECT title FROM pages WHERE id=page_id), '$$$', children_path), @returned_path);
        SET my_path = (SELECT @returned_path);
    END IF;
END$$

CREATE FUNCTION get_path (page_id INT)
    RETURNS VARCHAR(250) DETERMINISTIC
    BEGIN
        CALL get_path_procedure(page_id, '', @page_path);
        RETURN (SELECT @page_path);
    END$$

DELIMITER ;



insert into pages VALUES (1, 1, 'Manuał Medyczny', 'Zapraszam!', 1, NOW());
insert into pages VALUES (2, 1, 'Choroby genetyczne', '', 1, NOW());
insert into pages VALUES (3, 2, 'Aberracje chromosomowe', '', 1, NOW());
insert into pages VALUES (4, 3, 'Zespół Patau', '', 1, NOW());

SET @@GLOBAL.max_sp_recursion_depth = 255;
SET @@session.max_sp_recursion_depth = 255; 

SELECT *, get_path(id) FROM pages;

