from django.urls import path
from website.views import home, restaurant, place_order, register_account, login_account, logout_account, save_reservation, save_feedback

urlpatterns = [
    path("", home, name="home"),
    path("restaurant/", restaurant, name="restaurant"),
    path("restaurant/order/", place_order, name="place_order"),
    path("restaurant/register/", register_account, name="register_account"),
    path("restaurant/login/", login_account, name="login_account"),
    path("restaurant/logout/", logout_account, name="logout_account"),
    path("restaurant/reservation/", save_reservation, name="save_reservation"),
    path("restaurant/feedback/", save_feedback, name="save_feedback"),
]
