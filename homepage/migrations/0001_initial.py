# Generated by Django 2.1.5 on 2019-02-16 23:17

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=64)),
            ],
        ),
        migrations.CreateModel(
            name='Node',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=16)),
                ('type', models.IntegerField(default=0)),
                ('status', models.BooleanField(default=True)),
                ('connector', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='homepage.Node')),
            ],
        ),
        migrations.CreateModel(
            name='Path',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('distance', models.FloatField(default=1)),
                ('endNodeId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='endNodeId', to='homepage.Node')),
                ('startNodeId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='startNodeId', to='homepage.Node')),
            ],
        ),
        migrations.AddField(
            model_name='message',
            name='nodeId',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='homepage.Node'),
        ),
    ]