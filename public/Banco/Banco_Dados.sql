create database Izzi_Fitness;
use Izzi_Fitness;

create table usuarios(
id int auto_increment primary key,
email varchar(100),
nome_completo varchar(200),
senha_hash varchar(100)
)

