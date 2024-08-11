from drf_spectacular.utils import (
    OpenApiExample,
    extend_schema,
    inline_serializer,
)
from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.response import Response

from .models import CustomUser
from .serializers import (
    UserSerializer,
    UserSignInSerializer,
    UserSignUpSerializer,
)

# Create your views here.


class UserCreateAPIView(generics.CreateAPIView):
    """
    Create a new user
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    queryset = CustomUser.objects.all()
    # serializer_class = UserSignUpSerializer
    serializer_class = UserSerializer


class UserAPIViewSet(viewsets.ModelViewSet):
    """
    create(), retrieve(), list(), update(), partial_update(), delete().
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    # lookup_field = "nickname"

    # def perform_destroy(self, instance):
    #     setattr(instance, "is_active", False)


class UserCurrentAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Performs an action for requesting user himself.
    Possible actions: Retrieve(GET), Update(PUT), Partial Update(PATCH), and Delete(DELETE).
    """

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = request.user
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = request.user
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        for (key, value) in validated_data.items():
            if not hasattr(instance, key):
                raise serializers.ValidationError({key: "User does not have this field."})
            # Check if the new value is different from the existing value except password.
            if getattr(instance, key) == value:
                raise serializers.ValidationError({key: "The new value must be different from the existing value."})

        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = request.user
        self.perform_delete(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserSignInAPIView(generics.GenericAPIView):
    """
    Login a user
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    serializer_class = UserSignInSerializer

    @extend_schema(
        responses=inline_serializer(
            name="UserSignInResponseSerializer",
            fields={
                "pk": serializers.IntegerField(),
                "email": serializers.EmailField(),
                "nickname": serializers.CharField(),
                "picture": serializers.CharField(),
                "token": serializers.CharField(),
            },
        ),
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data  # Return value of serializer.validate()
        return Response(data, status=status.HTTP_200_OK)
