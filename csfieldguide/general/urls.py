"""URL routing for the general application."""

from django.urls import path
from . import views
from django.views.generic.base import RedirectView

app_name = "general"
urlpatterns = [
    # e.g. csfieldguide.org.nz/
    path(
        "",
        views.GeneralIndexView.as_view(),
        name="index"
    ),
    # e.g. /teacher/login/
    path(
        "teacher/login/",
        views.set_teacher_mode,
        {"mode": True},
        name="teacher_mode_login"
    ),
    # e.g. /teacher/logout/
    path(
        "teacher/logout/",
        views.set_teacher_mode,
        {"mode": False},
        name="teacher_mode_logout"
    ),
    path(
        "further-information/glossary.html",
        RedirectView.as_view(permanent=True, pattern_name="chapters:glossary"),
    ),
    path(
        "further-information/interactives.html",
        RedirectView.as_view(permanent=True, pattern_name="interactives:index"),
    ),
    path(
        "further-information/contributors.html",
        RedirectView.as_view(permanent=True, pattern_name="appendices:contributors"),
    ),
    path(
        "further-information/releases.html",
        RedirectView.as_view(permanent=True, url="https://cs-field-guide.readthedocs.io/en/latest/changelog.html"),
    ),
    path(
        "index.html",
        RedirectView.as_view(permanent=True, pattern_name="general:index"),
    ),
]
