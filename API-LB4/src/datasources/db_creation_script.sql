create sequence source_id_seq;

create table country
(
    id   serial
        primary key,
    name varchar(255) not null
        constraint country_name_unique
            unique
);

create table city
(
    id         serial
        primary key,
    name       varchar(255) not null
        constraint city_name_unique
            unique,
    country_id integer
        constraint city_country__fk
            references country
);

create index ix_city_name
    on city (name);

create index ix_country_name
    on country (name);

create table source
(
    id   integer default nextval('source_id_seq'::regclass) not null
        primary key,
    name varchar                                            not null
        constraint source_name_unique
            unique
);

alter sequence source_id_seq owned by source.id;

create table forecast
(
    id                   serial
        primary key,
    city_id              integer
        references city,
    country_id           integer
        references country,
    collection_date      timestamp not null,
    forecasted_day       timestamp not null,
    precipitation_chance integer
        constraint chk_precipitation_range
            check ((precipitation_chance >= 0) AND (precipitation_chance <= 100)),
    state                varchar(255),
    temp_high            integer,
    temp_low             integer,
    weather_condition    varchar(255),
    wind_speed           integer,
    source_id            integer   not null
        references source,
    precipitation_amount real,
    humidity             integer
);

create index ix_forecast_forecasted_day
    on forecast (forecasted_day);

create index ix_forecast_collection_date
    on forecast (collection_date);

create index ix_forecast_cityid_sourceid_forecasted_day
    on forecast (city_id, source_id, forecasted_day);

create index ix_forecast_cityid_forecasted_day
    on forecast (city_id, forecasted_day);

create index ix_forecast_country_id
    on forecast (country_id);

create index ix_forecast_country_source_id
    on forecast (country_id, source_id);

create index ix_source_name
    on source (name);


