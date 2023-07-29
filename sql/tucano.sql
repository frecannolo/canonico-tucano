-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: TUCANO_1
-- ------------------------------------------------------
-- Server version	10.11.2-MariaDB-1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` int(11) DEFAULT NULL,
  `room` varchar(255) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  `day` varchar(255) DEFAULT NULL,
  `time` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `user` int(11) DEFAULT NULL,
  `visualized` int(11) DEFAULT NULL,
  `secured` int(11) DEFAULT NULL,
  `id_email` int(11) DEFAULT NULL,
  `time_email` varchar(255) DEFAULT NULL,
  `idHistory` int(11) DEFAULT NULL,
  `canceled` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history`
--

LOCK TABLES `history` WRITE;
/*!40000 ALTER TABLE `history` DISABLE KEYS */;
INSERT INTO `history` VALUES
(21,1,'room 05','piano terra','29/07/2023','15:00 - 16:00','28/7/2023 alle 13:21','reason 1',6,1,0,NULL,'0 3 0',NULL,0),
(22,1,'room 05','piano terra','30/07/2023','14:00 - 15:00','28/7/2023 alle 13:21','reason 2',6,1,0,NULL,NULL,NULL,0),
(23,1,'room 05','piano terra','30/07/2023','17:00 - 18:00','28/7/2023 alle 13:21','reason 3',6,1,0,NULL,NULL,NULL,0),
(24,1,'room 12','primo piano','30/07/2023','15:00 - 16:00','28/7/2023 alle 14:55','ciao',6,1,1,NULL,NULL,NULL,0),
(25,2,'room 05','piano terra','30/07/2023','14:00 - 15:00','28/7/2023 alle 15:11',NULL,6,1,NULL,NULL,NULL,22,0),
(26,1,'room 08','primo piano','29/07/2023','16:00 - 17:00','28/7/2023 alle 15:12','gg',6,1,0,NULL,NULL,NULL,0),
(28,1,'room 32','quarto piano','30/07/2023','16:00 - 17:00','28/7/2023 alle 16:58','fre',6,1,0,NULL,NULL,NULL,0),
(33,1,'room 02','piano terra','30/07/2023','13:00 - 15:00','28/7/2023 alle 22:37','infatti',11,1,0,21,'0 0 10',NULL,0),
(34,1,'room 02','piano terra','29/07/2023','13:00 - 15:00','28/7/2023 alle 22:37','ecco',11,1,1,NULL,NULL,NULL,0);
/*!40000 ALTER TABLE `history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newCredential`
--

DROP TABLE IF EXISTS `newCredential`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `newCredential` (
  `id` int(11) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newCredential`
--

LOCK TABLES `newCredential` WRITE;
/*!40000 ALTER TABLE `newCredential` DISABLE KEYS */;
/*!40000 ALTER TABLE `newCredential` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `room` (
  `name` varchar(255) DEFAULT NULL,
  `zona` varchar(255) DEFAULT NULL,
  `css` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`css`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES
('room 01','piano terra','{\"sx\": \"10%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 02','piano terra','{\"sx\": \"30%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"40%\", \"height\": \"38%\"}'),
('room 03','piano terra','{\"sx\": \"69.5%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 04','piano terra','{\"sx\": \"10%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 05','piano terra','{\"sx\": \"30%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 06','piano terra','{\"sx\": \"50%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 07','piano terra','{\"sx\": \"69.5%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 08','primo piano','{\"sx\": \"10%\", \"top\": \"40px\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"auto\"}'),
('room 09','primo piano','{\"sx\": \"30%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"29.5%\", \"height\": \"38%\"}'),
('room 10','primo piano','{\"sx\": \"64.3%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"25.5%\", \"height\": \"38%\"}'),
('room 11','primo piano','{\"sx\": \"30%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"29.5%\", \"height\": \"38%\"}'),
('room 12','primo piano','{\"sx\": \"64.3%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"25.5%\", \"height\": \"38%\"}'),
('room 13','secondo piano','{\"sx\": \"10%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"15.1%\", \"height\": \"38%\"}'),
('room 14','secondo piano','{\"sx\": \"30%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"29.6%\", \"height\": \"38%\"}'),
('room 15','secondo piano','{\"sx\": \"64.5%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"25.5%\", \"height\": \"38%\"}'),
('room 16','secondo piano','{\"sx\": \"10%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"49.2%\", \"height\": \"38%\"}'),
('room 17','secondo piano','{\"sx\": \"64.5%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"25.5%\", \"height\": \"38%\"}'),
('room 18','terzo piano','{\"sx\": \"10%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 19','terzo piano','{\"sx\": \"30%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20.3%\", \"height\": \"38%\"}'),
('room 20','terzo piano','{\"sx\": \"50%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 21','terzo piano','{\"sx\": \"69.5%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 22','terzo piano','{\"sx\": \"10%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 23','terzo piano','{\"sx\": \"30%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.3%\", \"height\": \"38%\"}'),
('room 24','terzo piano','{\"sx\": \"50%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 25','terzo piano','{\"sx\": \"69.5%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 26','quarto piano','{\"sx\": \"10%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 27','quarto piano','{\"sx\": \"30%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"40%\", \"height\": \"38%\"}'),
('room 28','quarto piano','{\"sx\": \"69.5%\", \"top\": \"40px\", \"bottom\": \"unset\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 29','quarto piano','{\"sx\": \"10%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 30','quarto piano','{\"sx\": \"30%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"38%\"}'),
('room 31','quarto piano','{\"sx\": \"50%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20%\", \"height\": \"38%\"}'),
('room 32','quarto piano','{\"sx\": \"69.5%\", \"top\": \"unset\", \"bottom\": \"0\", \"width\": \"20.5%\", \"height\": \"38%\"}');
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `verified` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `removed` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(6,'cano','NTM5Zjk0NWYzYTM2YTMwNWQzZTU5ZDIzNGJmNjYxZTQ=','fre.canonico@gmail.com',1,'6RWLA3JksHqunk6bKJSWJ24jIex2vZHBxO5g8Jy4UzF1RXTORR',0),
(12,'canox','NTM5Zjk0NWYzYTM2YTMwNWQzZTU5ZDIzNGJmNjYxZTQ=','francesco.canonico@itiscuneo.eu',1,'M0LYGIFkhcwdxpkotYKYvVAVvHBi0DKBIFtvJvsoGpPJM19WmM',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-07-29 16:56:39
