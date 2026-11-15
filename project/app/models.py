from django.db import models
from django.contrib.auth.models import User


class PropertyType(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Тип")

    class Meta:
        verbose_name = "Тип объекта"
        verbose_name_plural = "Типы объектов"

    def __str__(self):
        return self.name


class Property(models.Model):
    class Deal(models.TextChoices):
        SALE = "sale", "Продажа"
        RENT = "rent", "Аренда"

    class Status(models.TextChoices):
        ACTIVE = "active", "В продаже"
        SOLD = "sold", "Продан"
        RESERVED = "reserved", "Забронирован"

    title = models.CharField(max_length=255, verbose_name="Название")
    address = models.CharField(max_length=255, verbose_name="Адрес")
    district = models.CharField(max_length=100, verbose_name="Район")
    property_type = models.ForeignKey(
        PropertyType, on_delete=models.PROTECT,
        related_name="properties", verbose_name="Тип"
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="properties",
        null=True, blank=True, verbose_name="Автор"
    )
    deal = models.CharField(max_length=10, choices=Deal.choices,
                            default=Deal.SALE, verbose_name="Сделка")
    status = models.CharField(max_length=10, choices=Status.choices,
                              default=Status.ACTIVE, verbose_name="Статус")
    price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Цена, ₽")
    rooms = models.PositiveSmallIntegerField(default=1, verbose_name="Комнат")
    area = models.DecimalField(max_digits=7, decimal_places=2, verbose_name="Площадь, м²")
    floor = models.PositiveSmallIntegerField(default=1, verbose_name="Этаж")
    total_floors = models.PositiveSmallIntegerField(default=1, verbose_name="Этажей в доме")
    description = models.TextField(blank=True, null=True, verbose_name="Описание")
    image_url = models.URLField(blank=True, null=True, verbose_name="Фото (ссылка)")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата добавления")

    class Meta:
        verbose_name = "Объект"
        verbose_name_plural = "Объекты"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ViewingRequest(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "Новая"
        PROCESSED = "processed", "Обработана"
        DONE = "done", "Завершена"

    property = models.ForeignKey(
        Property, on_delete=models.CASCADE,
        related_name="requests", verbose_name="Объект"
    )
    name = models.CharField(max_length=100, verbose_name="Имя клиента")
    phone = models.CharField(max_length=30, verbose_name="Телефон")
    comment = models.TextField(blank=True, null=True, verbose_name="Комментарий")
    preferred_date = models.DateField(blank=True, null=True, verbose_name="Желаемая дата")
    status = models.CharField(max_length=15, choices=Status.choices,
                              default=Status.NEW, verbose_name="Статус")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата заявки")

    class Meta:
        verbose_name = "Заявка на просмотр"
        verbose_name_plural = "Заявки на просмотр"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} → {self.property.title}"


class Agent(models.Model):
    name = models.CharField(max_length=255, verbose_name="Имя")
    role = models.CharField(max_length=255, verbose_name="Должность")
    photo_url = models.URLField(blank=True, null=True, verbose_name="Фото (ссылка)")
    phone = models.CharField(max_length=30, blank=True, null=True, verbose_name="Телефон")

    class Meta:
        verbose_name = "Агент"
        verbose_name_plural = "Агенты"

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    category = models.CharField(max_length=100, default="Советы", verbose_name="Категория")
    text = models.TextField(verbose_name="Текст статьи")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата публикации")

    class Meta:
        verbose_name = "Статья блога"
        verbose_name_plural = "Блог"

    def __str__(self):
        return self.title