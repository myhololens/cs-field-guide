# Generated by Django 2.2.3 on 2019-10-08 23:42

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('curriculum_guides', '0003_remove_curriculumguide_icon'),
    ]

    operations = [
        migrations.AlterField(
            model_name='curriculumguide',
            name='languages',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=10), default=list, size=None),
        ),
        migrations.AlterField(
            model_name='curriculumguidesection',
            name='languages',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=10), default=list, size=None),
        ),
    ]
