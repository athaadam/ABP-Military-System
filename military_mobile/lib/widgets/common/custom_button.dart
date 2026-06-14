import 'package:flutter/material.dart';
import '../../config/theme.dart';

enum ButtonVariant { primary, secondary, danger, success, warning }

class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final bool fullWidth;
  final IconData? icon;
  final EdgeInsets padding;

  const CustomButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.fullWidth = false,
    this.icon,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
  });

  Color get _backgroundColor {
    switch (variant) {
      case ButtonVariant.primary:
        return AppTheme.primary;
      case ButtonVariant.secondary:
        return AppTheme.darkSurface;
      case ButtonVariant.danger:
        return AppTheme.error;
      case ButtonVariant.success:
        return AppTheme.success;
      case ButtonVariant.warning:
        return AppTheme.warning;
    }
  }

  Color get _foregroundColor {
    if (variant == ButtonVariant.secondary) {
      return AppTheme.textPrimary;
    }
    return Colors.white;
  }

  @override
  Widget build(BuildContext context) {
    final button = ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: _backgroundColor,
        foregroundColor: _foregroundColor,
        disabledBackgroundColor: AppTheme.border.withValues(alpha: 0.5),
        padding: padding,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: isLoading
          ? SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(_foregroundColor),
              ),
            )
          : Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[
                  Icon(icon, size: 18),
                  SizedBox(width: 8),
                ],
                Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
              ],
            ),
    );

    if (fullWidth) {
      return SizedBox(width: double.infinity, child: button);
    }
    return button;
  }
}
