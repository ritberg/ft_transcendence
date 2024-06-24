from django.core.exceptions import ValidationError

class SpecialCharacterValidator:
    def validate(self, password, user=None):
        if not any(char in '@$!%*?&' for char in password):
            raise ValidationError(
                "The password must contain at least one special character (@$!%*?&)."
            )

    def get_help_text(self):
        return "Your password must contain at least one special character (@$!%*?&)."
    
class UppercaseValidator:
    def validate(self, password, user=None):
        if not any(char.isupper() for char in password):
            raise ValidationError(
                "The password must contain at least one uppercase letter."
            )

    def get_help_text(self):
        return "Your password must contain at least one uppercase letter."