# Generated by Django 2.1.7 on 2019-02-23 03:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('homepage', '0002_auto_20190219_2356'),
    ]

    operations = [
        migrations.AddField(
            model_name='node',
            name='link',
            field=models.ManyToManyField(to='homepage.Node'),
        ),
    ]
