"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from rest_framework import routers

from .views import (
    GameLogListView,
    OtherUserDetailView,
    UserAPIViewSet,
    UserCreateAPIView,
    UserCurrentAPIView,
    UserSignInAPIView,
    block,
    follow,
    get_active_user_list,
    get_block_list,
    getFollowList,
)

router = routers.SimpleRouter()
router.register("", UserAPIViewSet)

urlpatterns = [
    path("active/", get_active_user_list),
    path("signup/", UserCreateAPIView.as_view()),
    path("signin/", UserSignInAPIView.as_view()),
    path("current/follow/<int:pk>/", follow),
    path("current/follow/", getFollowList),
    path("current/block/<int:pk>/", block),
    path("current/block/", get_block_list),
    path("current/other/<int:pk>", OtherUserDetailView),
    path("current/", UserCurrentAPIView.as_view()),
    path("logs/<int:pk>", GameLogListView),
]

urlpatterns += router.urls
