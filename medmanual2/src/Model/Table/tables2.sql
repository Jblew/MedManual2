ALTER DATABASE medmanual2 CHARACTER SET utf8 COLLATE utf8_bin;


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
    title VARCHAR (255) NOT NULL UNIQUE,
    body LONGTEXT,
    user_id INT NOT NULL,
    version_date DATETIME DEFAULT NULL
);

CREATE TABLE pages_parents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    page_id INT UNSIGNED,
    parent_id INT UNSIGNED
);

CREATE TABLE tags (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag VARCHAR(255) UNIQUE NOT NULL,
    page_id INT UNSIGNED NOT NULL
);


# Sample data
# Manuał Medyczny (1)
# Manuał medyczny (1) > choroby i objawy (2)
# #Manuał medyczny (1) > choroby i objawy (2) > układ immunologiczny (3)
# Manuał medyczny (1) > choroby i objawy (2) > Choroby genetyczne (4)
# Manuał medyczny (1) > choroby i objawy (2) > Choroby genetyczne (4) > Choroby jednogenowe (5)
# Manuał medyczny (1) > choroby i objawy (2) > układ immunologiczny (3) > Wrodzony niedobór IgA (6)
# Manuał medyczny (1) > choroby i objawy (2) > Choroby genetyczne (4) > Choroby jednogenowe (5) > Wrodzony niedobór IgA (6)

insert into pages VALUES (1, 'Manuał Medyczny', 'Zapraszam!', 1, NOW());
# insert into pages VALUES (2, 'Choroby i objawy', '', 1, NOW());
# insert into pages VALUES (3, 'Układ immunologiczny', '', 1, NOW());
# insert into pages VALUES (4, 'Choroby genetyczne', '', 1, NOW());
# insert into pages VALUES (5, 'Choroby jednogenowe', '', 1, NOW());
# insert into pages VALUES (6, 'Wrodzony niedobór IgA', '', 1, NOW());
# insert into pages VALUES (7, 'Aberracje chromosomowe', '', 1, NOW());
#  insert into pages VALUES (8, 'Zespół Patau', '', 1, NOW());

# insert into pages_parents (page_id, parent_id) VALUES (2, 1);
# insert into pages_parents (page_id, parent_id) VALUES (3, 2);
# insert into pages_parents (page_id, parent_id) VALUES (4, 2);
# insert into pages_parents (page_id, parent_id) VALUES (5, 4);
# insert into pages_parents (page_id, parent_id) VALUES (6, 3);
# insert into pages_parents (page_id, parent_id) VALUES (6, 5);
# insert into pages_parents (page_id, parent_id) VALUES (7, 4);
# insert into pages_parents (page_id, parent_id) VALUES (8, 7);

# Teraz chcę zdobyć ścieżki do (6). 

DROP PROCEDURE IF EXISTS get_paths_procedure;
DELIMITER $$
CREATE PROCEDURE get_paths_procedure(
    IN current_page_id INT,
    IN children_path VARCHAR (253)
)
BEGIN
    DECLARE my_parent_id INT;
    DECLARE bDone INT;
    DECLARE curs CURSOR FOR SELECT parent_id FROM pages_parents WHERE page_id=current_page_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET bDone = 1;
        

    IF current_page_id = 1 THEN
         INSERT INTO paths VALUES (CONCAT((SELECT title FROM pages WHERE id=current_page_id), '$$$', children_path));
    ELSE
        OPEN curs;
        SET bDone = 0;
        read_loop: LOOP
            FETCH curs INTO my_parent_id;
            IF bDone THEN
                LEAVE read_loop;
            END IF;
#            INSERT INTO paths VALUES (my_parent_id);
#            INSERT INTO paths VALUES (CONCAT((SELECT title FROM pages WHERE id=parent_id), '$$$', children_path));
            CALL get_paths_procedure(my_parent_id, CONCAT((SELECT title FROM pages WHERE id=current_page_id), '$$$', children_path));
        END LOOP;
        CLOSE curs;
    END IF;
END$$

DELIMITER ;


SET @@GLOBAL.max_sp_recursion_depth = 255;
SET @@session.max_sp_recursion_depth = 255; 
DROP TEMPORARY TABLE IF EXISTS paths;
CREATE TEMPORARY TABLE paths (path VARCHAR(255));

CALL get_paths_procedure(6, '');

SELECT * FROM paths;
DROP TEMPORARY TABLE IF EXISTS paths;


