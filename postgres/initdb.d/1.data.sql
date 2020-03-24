-- INSERT INTO localization.language (id) VALUES ('ru');
-- INSERT INTO localization.language (id) VALUES ('en');

-- -- EXAMPLE
-- -- INSERT INTO localization.word (id) VALUES ('offense');
-- -- INSERT INTO localization.translate (id, word, language, value) VALUES ('b8eb32f3-1dc6-4296-a48c-8f3684a012f5', 'offense', 'ru', 'Атака');
-- -- INSERT INTO localization.translate (id, word, language, value) VALUES ('b8eb32f3-1dc6-4296-a48c-8f3684a012f5', 'offense', 'en', 'Attack');


-- INSERT INTO localization.word (id) VALUES ('energy.x2');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x2', 'ru', 'Очень мало энергии');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x2', 'en', 'Very little energy');
-- INSERT INTO equipment.item(id, name) VALUES ('85f1c9f4-b547-4f41-816b-1267a9998e1a', 'energy.x2');

-- INSERT INTO localization.word (id) VALUES ('energy.x4');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x4', 'ru', 'Мало энергии');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x4', 'en', 'Little energy');
-- INSERT INTO equipment.item(id, name) VALUES ('3959fdd5-4ccd-4c1d-bcee-32bb15d00c63', 'energy.x4');

-- INSERT INTO localization.word (id) VALUES ('energy.x8');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x8', 'ru', 'Немного энергии');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x8', 'en', 'Some energy');
-- INSERT INTO equipment.item(id, name) VALUES ('d0bd8bdd-6cf8-48ee-9045-30c79184cc8f', 'energy.x8');

-- INSERT INTO localization.word (id) VALUES ('energy.x16');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x16', 'ru', 'Много энергии');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x16', 'en', 'A lot of energy');
-- INSERT INTO equipment.item(id, name) VALUES ('00be7b27-4e57-48fa-ac60-db71e3851bd2', 'energy.x16');

-- INSERT INTO localization.word (id) VALUES ('energy.x32');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x32', 'ru', 'Очень много энергии');
-- INSERT INTO localization.translate (word, language, value) VALUES ('energy.x32', 'en', 'Much energy');
-- INSERT INTO equipment.item(id, name) VALUES ('faf031f5-bbdd-4849-8458-1de47d2ae1b0', 'energy.x32');

-- INSERT INTO equipment.combination (item, input, output) VALUES ('85f1c9f4-b547-4f41-816b-1267a9998e1a', '85f1c9f4-b547-4f41-816b-1267a9998e1a', '3959fdd5-4ccd-4c1d-bcee-32bb15d00c63');
-- INSERT INTO equipment.combination (item, input, output) VALUES ('3959fdd5-4ccd-4c1d-bcee-32bb15d00c63', '3959fdd5-4ccd-4c1d-bcee-32bb15d00c63', 'd0bd8bdd-6cf8-48ee-9045-30c79184cc8f');
-- INSERT INTO equipment.combination (item, input, output) VALUES ('d0bd8bdd-6cf8-48ee-9045-30c79184cc8f', 'd0bd8bdd-6cf8-48ee-9045-30c79184cc8f', '00be7b27-4e57-48fa-ac60-db71e3851bd2');
-- INSERT INTO equipment.combination (item, input, output) VALUES ('00be7b27-4e57-48fa-ac60-db71e3851bd2', '00be7b27-4e57-48fa-ac60-db71e3851bd2', 'faf031f5-bbdd-4849-8458-1de47d2ae1b0');

-- INSERT INTO localization.word (id) VALUES ('damage.x2');
-- INSERT INTO localization.translate (word, language, value) VALUES ('damage.x2', 'ru', 'Ссадина');
-- INSERT INTO localization.translate (word, language, value) VALUES ('damage.x2', 'en', 'Abrasion');
-- INSERT INTO equipment.item(id, name) VALUES ('a36cc9a5-93cd-4a99-a871-044efbdf274e', 'damage.x2');

-- INSERT INTO localization.word (id) VALUES ('damage.x4');
-- INSERT INTO localization.translate (word, language, value) VALUES ('damage.x4', 'ru', 'Гематома');
-- INSERT INTO localization.translate (word, language, value) VALUES ('damage.x4', 'en', 'Hematoma');
-- INSERT INTO equipment.item(id, name) VALUES ('bbf47013-5950-4e41-a8bb-77e2f1065ec1', 'damage.x4');

-- INSERT INTO localization.word (id) VALUES ('jab');
-- INSERT INTO localization.translate (word, language, value) VALUES ('jab', 'ru', 'Джеб');
-- INSERT INTO localization.translate (word, language, value) VALUES ('jab', 'en', 'Jab');
-- INSERT INTO equipment.item(id, name) VALUES ('825a8c8c-917c-4e08-bef8-7bc0bd05f89a', 'jab');

-- -- jab + energy.x2 = damage.x2
-- INSERT INTO equipment.combination (item, input, output) VALUES ('825a8c8c-917c-4e08-bef8-7bc0bd05f89a', '85f1c9f4-b547-4f41-816b-1267a9998e1a', 'a36cc9a5-93cd-4a99-a871-044efbdf274e');
-- -- jab + energy.x4 = damage.x4
-- INSERT INTO equipment.combination (item, input, output) VALUES ('825a8c8c-917c-4e08-bef8-7bc0bd05f89a', '3959fdd5-4ccd-4c1d-bcee-32bb15d00c63', 'bbf47013-5950-4e41-a8bb-77e2f1065ec1');

-- INSERT INTO localization.word (id) VALUES ('jab.x2');
-- INSERT INTO localization.translate (word, language, value) VALUES ('jab.x2', 'ru', 'Двойной джеб');
-- INSERT INTO localization.translate (word, language, value) VALUES ('jab.x2', 'en', 'Double jab');
-- INSERT INTO equipment.item(id, name) VALUES ('b9fab760-0d35-4535-8c99-4d70daa8bb6e', 'jab.x2');

-- -- jab + jab = jab.x2
-- INSERT INTO equipment.combination (is_basic, item, input, output) VALUES (true, '825a8c8c-917c-4e08-bef8-7bc0bd05f89a', '825a8c8c-917c-4e08-bef8-7bc0bd05f89a', 'b9fab760-0d35-4535-8c99-4d70daa8bb6e');
-- -- jab.x2 + energy.x2 = damage.x4
-- INSERT INTO equipment.combination (item, input, output) VALUES ('b9fab760-0d35-4535-8c99-4d70daa8bb6e', '85f1c9f4-b547-4f41-816b-1267a9998e1a', 'bbf47013-5950-4e41-a8bb-77e2f1065ec1');

