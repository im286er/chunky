# ************************************************************
# Sequel Pro SQL dump
# Version 3408
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.5.25)
# Database: philparsons_meecrob
# Generation Time: 2012-11-03 08:17:56 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table articles
# ------------------------------------------------------------

DROP TABLE IF EXISTS `articles`;

CREATE TABLE `articles` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT '',
  `content` longtext,
  `type` char(8) NOT NULL DEFAULT 'post',
  `show_in_nav` tinyint(4) DEFAULT '0',
  `menu_text` varchar(40) DEFAULT NULL,
  `status` char(10) DEFAULT 'draft',
  `url_slug` varchar(255) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `SLUG` (`url_slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;

INSERT INTO `articles` (`id`, `title`, `content`, `type`, `show_in_nav`, `menu_text`, `status`, `url_slug`, `created`, `updated`)
VALUES
	(1,'Phils amazing post!','is awesome!','page',1,'About','draft','amazing-post','2012-10-28 12:39:21','2012-10-28 12:54:11'),
	(2,'new page','woot','post',0,'','draft',NULL,'2012-10-28 12:39:21',NULL),
	(3,'Save with an id','Pweeese','post',1,'Contact','draft','save-with-an-id','2012-10-28 12:39:21',NULL),
	(4,'Phil\'s new page','is epic','post',0,'','draft',NULL,'2012-10-28 12:39:21',NULL),
	(5,'Last dummy page check','whallop trollop','post',0,'','draft',NULL,'2012-10-28 12:39:21',NULL),
	(6,'New page','New page content','post',0,NULL,'draft',NULL,'2012-11-03 07:31:28',NULL),
	(7,'New page','New page content','post',0,NULL,'draft',NULL,'2012-11-03 07:31:28',NULL);

/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
