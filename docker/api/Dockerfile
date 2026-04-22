FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    zip \
    unzip \
    git

RUN docker-php-ext-install pdo pdo_pgsql sockets

RUN pecl install redis && docker-php-ext-enable redis

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

COPY apps/api/composer.json ./
COPY apps/api/composer.lock* ./

RUN composer install

COPY apps/api .

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
