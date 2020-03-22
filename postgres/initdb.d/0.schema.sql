create extension if not exists "uuid-ossp";
create schema localization;
create table localization.language (id char(2) primary key not null);
create table localization.word (
  id varchar(256) primary key check(id ~ '^[a-z][a-z0-9.]+$')
);
create table localization.translate (
  language char(2) not null references localization.language(id) on delete restrict on update cascade,
  word varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  value text,
  primary key(language, word)
);


create schema account;
create table account.user (
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) default null,
  avatar text default null,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create table account.email (
  id uuid primary key not null default uuid_generate_v4(),
  address varchar(256) not null,
  confirmed timestamp with time zone default null,
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create type account.sign_type as enum('facebook', 'password');
create table account.sign (
  id uuid primary key not null default uuid_generate_v4(),
  type account.sign_type not null,
  data text not null,
  "user" uuid default null references account.user(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create table account.token (
  id uuid primary key not null default uuid_generate_v4(),
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  ip inet default null,
  sign uuid default null references account.sign(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  expired timestamp with time zone default null
);

create schema equipment;
create type equipment.attribute as enum(
  'container',
  'card', 
  'deck'
);
create domain equipment.quality as integer default null check((value > 0 AND value <= 100000) or value is null);
create table equipment.object (
  id uuid primary key not null default uuid_generate_v4(),
  name varchar(256) not null references localization.word(id) on delete restrict on update cascade,
  attribute equipment.attribute[] not null,
  quality equipment.quality
);
create table equipment.combination (
  id uuid primary key not null default uuid_generate_v4(),
  object uuid not null references equipment.object(id) on delete cascade on update cascade,
  input uuid not null references equipment.object(id) on delete restrict on update cascade,
  output uuid not null references equipment.object(id) on delete restrict on update cascade,
  is_basic boolean not null default false,
  unique(object, input, output)
);
create table equipment.content (
  id uuid primary key not null default uuid_generate_v4(),
  object uuid not null references equipment.object(id) on delete cascade on update cascade,
  item uuid not null references equipment.object(id) on delete cascade on update cascade,
  created timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null,
  unique(object, item)
);
create index on equipment.content(created);
create index on equipment.content(deleted);

create table account.object (
  id uuid primary key not null default uuid_generate_v4(),
  "user" uuid not null references account.user(id) on delete cascade on update cascade,
  object uuid not null references equipment.object(id) on delete restrict on update cascade,
  fragility equipment.quality,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone not null default current_timestamp,
  deleted timestamp with time zone default null
);
create index on account.object(created);
create index on account.object(updated);
create index on account.object(deleted);