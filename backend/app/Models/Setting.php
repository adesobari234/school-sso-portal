<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    protected static array $memoryCache = [];

    public static function getValue(string $key, $default = null)
    {
        if (array_key_exists($key, self::$memoryCache)) {
            return self::$memoryCache[$key];
        }

        $setting = static::where('key', $key)->first();
        $value = $setting ? $setting->value : $default;

        self::$memoryCache[$key] = $value;
        return $value;
    }

    public static function setValue(string $key, $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}