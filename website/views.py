import json
from datetime import datetime

from django import forms
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST, require_http_methods

from .models import Feedback, Order, Reservation

MENU = [
    {"id": "garden-bowl", "name": "Garden crunch bowl", "category": "Fresh", "description": "Seasonal greens, roasted chickpeas, lemon tahini.", "price": 260, "emoji": "🥗"},
    {"id": "tomato-pasta", "name": "Slow tomato pasta", "category": "Mains", "description": "House tomato sauce, basil and parmesan.", "price": 340, "emoji": "🍝"},
    {"id": "mushroom-toast", "name": "Wild mushroom toast", "category": "Mains", "description": "Garlic mushrooms on toasted sourdough.", "price": 310, "emoji": "🍄"},
    {"id": "citrus-cake", "name": "Citrus olive oil cake", "category": "Dessert", "description": "Soft cake with seasonal citrus and cream.", "price": 190, "emoji": "🍰"},
    {"id": "lemon-soda", "name": "Sparkling lemon soda", "category": "Drinks", "description": "Fresh lemon, mint and sparkling water.", "price": 120, "emoji": "🍋"},
    {"id": "iced-coffee", "name": "Cold brew coffee", "category": "Drinks", "description": "Slow-steeped coffee served over ice.", "price": 160, "emoji": "☕"},
]


def home(request):
    return render(request, "website/home.html")


def restaurant(request):
    return render(request, "website/restaurant.html", {
        "menu": MENU,
        "categories": list(dict.fromkeys(item["category"] for item in MENU)),
        "reservation_status": request.GET.get("reservation", ""),
        "feedback_status": request.GET.get("feedback", ""),
        "recent_feedback": Feedback.objects.all()[:4],
    })


@require_POST
def place_order(request):
    try:
        name = forms.CharField(max_length=100).clean(request.POST.get("name", "").strip())
        email = forms.EmailField().clean(request.POST.get("email", "").strip())
        cart = json.loads(request.POST.get("cart", "[]"))
        menu = {item["id"]: item for item in MENU}
        if not isinstance(cart, list) or not cart:
            raise ValueError("Add at least one item to your basket.")
        saved_items, total = [], 0
        for entry in cart:
            if not isinstance(entry, dict) or entry.get("id") not in menu:
                raise ValueError("One of the menu items is not available.")
            quantity = int(entry.get("quantity", 0))
            if quantity < 1 or quantity > 25:
                raise ValueError("Choose between 1 and 25 of each item.")
            item = menu[entry["id"]]
            line_total = item["price"] * quantity
            total += line_total
            saved_items.append({"name": item["name"], "quantity": quantity, "unit_price": item["price"], "line_total": line_total})
        order = Order.objects.create(
            customer=request.user if request.user.is_authenticated else None,
            customer_name=name, email=email, items=saved_items, total=total,
        )
        return JsonResponse({"ok": True, "order_id": order.pk, "total": f"{order.total:.2f}"})
    except (ValidationError, ValueError, TypeError, json.JSONDecodeError) as error:
        message = error.messages[0] if isinstance(error, ValidationError) else str(error)
        return JsonResponse({"ok": False, "error": message or "Please check your order details."}, status=400)


@require_POST
def save_reservation(request):
    try:
        name = forms.CharField(max_length=100).clean(request.POST.get("name", "").strip())
        email = forms.EmailField().clean(request.POST.get("email", "").strip())
        party_size = int(request.POST.get("party_size", 0))
        if party_size < 1 or party_size > 12:
            raise ValueError("Reservations are for 1 to 12 guests.")
        reservation_at = datetime.strptime(request.POST.get("reservation_at", ""), "%Y-%m-%dT%H:%M")
        reservation_at = timezone.make_aware(reservation_at, timezone.get_current_timezone())
        if reservation_at <= timezone.now():
            raise ValueError("Choose a future date and time.")
        Reservation.objects.create(
            customer=request.user if request.user.is_authenticated else None,
            customer_name=name, email=email, reservation_at=reservation_at,
            party_size=party_size, notes=request.POST.get("notes", "").strip()[:300],
        )
        return redirect("/restaurant/?reservation=success#book")
    except (ValidationError, ValueError, TypeError) as error:
        message = error.messages[0] if isinstance(error, ValidationError) else str(error)
        return redirect("/restaurant/?reservation=error#book")


@require_POST
def save_feedback(request):
    try:
        name = forms.CharField(max_length=100).clean(request.POST.get("name", "").strip())
        rating = int(request.POST.get("rating", 0))
        message = forms.CharField(max_length=1000).clean(request.POST.get("message", "").strip())
        if rating < 1 or rating > 5:
            raise ValueError("Choose a rating from 1 to 5.")
        Feedback.objects.create(customer=request.user if request.user.is_authenticated else None, customer_name=name, rating=rating, message=message)
        return redirect("/restaurant/?feedback=success#feedback")
    except (ValidationError, ValueError, TypeError):
        return redirect("/restaurant/?feedback=error#feedback")


@require_http_methods(["GET", "POST"])
def register_account(request):
    form = UserCreationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        try:
            email = forms.EmailField().clean(request.POST.get("email", "").strip())
        except ValidationError:
            return render(request, "website/account.html", {"form": form, "mode": "register", "email_error": "Enter a valid email address."})
        user = form.save()
        user.email = email
        user.save(update_fields=["email"])
        login(request, user)
        return redirect("restaurant")
    return render(request, "website/account.html", {"form": form, "mode": "register"})


@require_http_methods(["GET", "POST"])
def login_account(request):
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.get_user())
        return redirect("restaurant")
    return render(request, "website/account.html", {"form": form, "mode": "login"})


@require_POST
def logout_account(request):
    logout(request)
    return redirect("restaurant")
