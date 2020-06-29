create extension if not exists "uuid-ossp";

create schema localization;

create table localization.language(id char(2) primary key not null);
create table localization.word(
  id varchar(256) primary key not null check(id ~ '^[a-z][a-z0-9.]+$')
);
create table localization.translate(
  language char(2) not null references localization.language(id) on delete restrict on update cascade,
  word varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  value text,
  primary key(language, word)
);

create schema account;

create table account.user(
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) default null,
  avatar text default null,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create type account.permission_level as enum('-', 'r', 'rw');
create table account.permission(
  "user" uuid primary key not null references account.user(id) on delete cascade on update cascade,
  item account.permission_level not null default '-',
  space account.permission_level not null default '-'
);
create table account.email(
  id uuid primary key not null default uuid_generate_v4(),
  address varchar(256) not null,
  confirmed timestamp with time zone default null,
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create type account.sign_type as enum('facebook', 'password');
create table account.sign(
  id uuid primary key not null default uuid_generate_v4(),
  type account.sign_type not null,
  data text not null,
  "user" uuid default null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create table account.token(
  id uuid primary key not null default uuid_generate_v4(),
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  ip inet default null,
  sign uuid default null references account.sign(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  expired timestamp with time zone default null
);

create schema object;
create table object.label(
  id varchar(256) primary key not null check(id ~ '^[a-z][a-z0-9.]+$')
);
create table object.node(
  id uuid primary key not null default uuid_generate_v4(),
  label varchar(256) not null references object.label(id) on delete restrict on update cascade, 
  property jsonb default null, 
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create table object.edge(
  id uuid primary key not null default uuid_generate_v4(),
  label varchar(256) not null references object.label(id) on delete restrict on update cascade,
  property jsonb default null, 
  "from" uuid not null references object.node(id) on delete cascade on update cascade,
  "to" uuid not null references object.node(id) on delete cascade on update cascade
);
